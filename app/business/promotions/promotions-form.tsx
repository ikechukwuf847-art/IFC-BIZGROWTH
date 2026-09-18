"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Promotion = {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  image_path: string | null;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Props = {
  businessId: string;
  initialPromotions: Promotion[];
};

type PromotionFormState = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

const emptyForm: PromotionFormState = {
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(
    date.getTime() - offset * 60 * 1000,
  );

  return localDate.toISOString().slice(0, 16);
}

export default function PromotionsForm({
  businessId,
  initialPromotions,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const [promotions, setPromotions] =
    useState<Promotion[]>(initialPromotions);

  const [form, setForm] =
    useState<PromotionFormState>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);
  }

  function handleChange(
    field: keyof PromotionFormState,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, or WebP image.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Promotion images must be 5MB or smaller.",
      );

      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);
  }

  function startEditing(promotion: Promotion) {
    setEditingId(promotion.id);

    setForm({
      title: promotion.title,
      description: promotion.description ?? "",
      startsAt: toDateTimeLocal(
        promotion.starts_at,
      ),
      endsAt: promotion.ends_at
        ? toDateTimeLocal(promotion.ends_at)
        : "",
      isActive: promotion.is_active,
    });

    setSelectedImage(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadImage(
    file: File,
    promotionId: string,
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const path =
      `${businessId}/promotions/${promotionId}/image.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("business-media")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    return path;
  }

  async function deleteStorageImage(
    path: string | null,
  ) {
    if (!path) {
      return;
    }

    await supabase.storage
      .from("business-media")
      .remove([path]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const title = form.title.trim();

      if (!title) {
        throw new Error(
          "Promotion title is required.",
        );
      }

      if (!form.startsAt) {
        throw new Error(
          "Promotion start date and time are required.",
        );
      }

      const startsAtDate =
        new Date(form.startsAt);

      if (
        Number.isNaN(
          startsAtDate.getTime(),
        )
      ) {
        throw new Error(
          "Please enter a valid start date and time.",
        );
      }

      let endsAtDate: Date | null = null;

      if (form.endsAt) {
        endsAtDate = new Date(form.endsAt);

        if (
          Number.isNaN(
            endsAtDate.getTime(),
          )
        ) {
          throw new Error(
            "Please enter a valid end date and time.",
          );
        }

        if (
          endsAtDate.getTime() <=
          startsAtDate.getTime()
        ) {
          throw new Error(
            "The end date must be after the start date.",
          );
        }
      }

      const startsAt =
        startsAtDate.toISOString();

      const endsAt =
        endsAtDate?.toISOString() ?? null;

      if (editingId) {
        const {
          data: updatedPromotion,
          error: updateError,
        } = await supabase
          .from("business_promotions")
          .update({
            title,
            description:
              form.description.trim() || null,
            starts_at: startsAt,
            ends_at: endsAt,
            is_active: form.isActive,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("business_id", businessId)
          .select()
          .single();

        if (updateError) {
          throw new Error(
            updateError.message,
          );
        }

        if (!updatedPromotion) {
          throw new Error(
            "Promotion could not be updated.",
          );
        }

        if (selectedImage) {
          const oldPath =
            updatedPromotion.image_path;

          const newPath =
            await uploadImage(
              selectedImage,
              updatedPromotion.id,
            );

          const {
            data: promotionWithImage,
            error: imageError,
          } = await supabase
            .from("business_promotions")
            .update({
              image_path: newPath,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              updatedPromotion.id,
            )
            .eq(
              "business_id",
              businessId,
            )
            .select()
            .single();

          if (imageError) {
            await deleteStorageImage(
              newPath,
            );

            throw new Error(
              imageError.message,
            );
          }

          if (
            oldPath &&
            oldPath !== newPath
          ) {
            await deleteStorageImage(
              oldPath,
            );
          }

          if (promotionWithImage) {
            setPromotions((current) =>
              current.map((item) =>
                item.id ===
                promotionWithImage.id
                  ? promotionWithImage
                  : item,
              ),
            );
          }
        } else {
          setPromotions((current) =>
            current.map((item) =>
              item.id ===
              updatedPromotion.id
                ? updatedPromotion
                : item,
            ),
          );
        }

        setMessage(
          "Promotion updated successfully.",
        );
      } else {
        const {
          data: createdPromotion,
          error: insertError,
        } = await supabase
          .from("business_promotions")
          .insert({
            business_id: businessId,
            title,
            description:
              form.description.trim() || null,
            starts_at: startsAt,
            ends_at: endsAt,
            is_active: form.isActive,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(
            insertError.message,
          );
        }

        if (!createdPromotion) {
          throw new Error(
            "Promotion could not be created.",
          );
        }

        let finalPromotion =
          createdPromotion;

        if (selectedImage) {
          const newPath =
            await uploadImage(
              selectedImage,
              createdPromotion.id,
            );

          const {
            data: promotionWithImage,
            error: imageError,
          } = await supabase
            .from("business_promotions")
            .update({
              image_path: newPath,
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              createdPromotion.id,
            )
            .eq(
              "business_id",
              businessId,
            )
            .select()
            .single();

          if (imageError) {
            await deleteStorageImage(
              newPath,
            );

            await supabase
              .from("business_promotions")
              .delete()
              .eq(
                "id",
                createdPromotion.id,
              )
              .eq(
                "business_id",
                businessId,
              );

            throw new Error(
              imageError.message,
            );
          }

          if (promotionWithImage) {
            finalPromotion =
              promotionWithImage;
          }
        }

        setPromotions((current) => [
          finalPromotion,
          ...current,
        ]);

        setMessage(
          "Promotion created successfully.",
        );
      }

      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(
    promotion: Promotion,
  ) {
    const confirmed = window.confirm(
      `Delete "${promotion.title}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(promotion.id);
    setError("");
    setMessage("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("business_promotions")
        .delete()
        .eq("id", promotion.id)
        .eq("business_id", businessId);

      if (deleteError) {
        throw new Error(
          deleteError.message,
        );
      }

      if (promotion.image_path) {
        await deleteStorageImage(
          promotion.image_path,
        );
      }

      setPromotions((current) =>
        current.filter(
          (item) =>
            item.id !== promotion.id,
        ),
      );

      if (editingId === promotion.id) {
        resetForm();
      }

      setMessage(
        "Promotion deleted successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this promotion.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview,
        );
      }
    };
  }, [imagePreview]);

  return (
    <div className="promotions-content">
      <section className="promotions-card">
        <div className="promotions-card__header">
          <div>
            <h2>
              {editingId
                ? "Edit promotion"
                : "Create a promotion"}
            </h2>

            <p>
              Let customers know about special
              offers, discounts, events, or
              other business updates.
            </p>
          </div>
        </div>

        {error && (
          <div className="promotions-alert promotions-alert--error">
            {error}
          </div>
        )}

        {message && (
          <div className="promotions-alert promotions-alert--success">
            {message}
          </div>
        )}

        <form
          className="promotions-form"
          onSubmit={handleSubmit}
        >
          <label className="promotions-field">
            <span>Promotion title *</span>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                handleChange(
                  "title",
                  event.target.value,
                )
              }
              placeholder="e.g. 20% Off Office Furniture"
              maxLength={160}
              required
            />
          </label>

          <label className="promotions-field">
            <span>Description</span>

            <textarea
              value={form.description}
              onChange={(event) =>
                handleChange(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Describe your promotion..."
              rows={5}
              maxLength={3000}
            />
          </label>

          <div className="promotions-form__grid">
            <label className="promotions-field">
              <span>Starts *</span>

              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  handleChange(
                    "startsAt",
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <label className="promotions-field">
              <span>Ends</span>

              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) =>
                  handleChange(
                    "endsAt",
                    event.target.value,
                  )
                }
              />

              <small>
                Leave empty if the promotion has
                no end date.
              </small>
            </label>
          </div>

          <div className="promotions-field">
            <span>Promotion image</span>

            <div className="promotions-upload">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Selected promotion"
                  className="promotions-upload__preview"
                />
              ) : (
                <div className="promotions-upload__empty">
                  <strong>
                    Upload promotion image
                  </strong>

                  <span>
                    JPG, PNG or WebP · Maximum 5MB
                  </span>
                </div>
              )}

              <label className="promotions-upload__button">
                {selectedImage
                  ? "Change image"
                  : "Choose image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  hidden
                />
              </label>
            </div>
          </div>

          <label className="promotions-check">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                handleChange(
                  "isActive",
                  event.target.checked,
                )
              }
            />

            <span>
              <strong>
                Promotion is active
              </strong>

              <small>
                Active promotions can be shown
                to customers when they are within
                their scheduled period.
              </small>
            </span>
          </label>

          <div className="promotions-form__actions">
            <button
              type="submit"
              className="promotions-button promotions-button--primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create promotion"}
            </button>

            {editingId && (
              <button
                type="button"
                className="promotions-button promotions-button--secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="promotions-card">
        <div className="promotions-card__header">
          <div>
            <h2>Your promotions</h2>

            <p>
              {promotions.length === 0
                ? "You have not created any promotions yet."
                : `${promotions.length} promotion${
                    promotions.length === 1
                      ? ""
                      : "s"
                  }`}
            </p>
          </div>
        </div>

        {promotions.length === 0 ? (
          <div className="promotions-empty">
            <div className="promotions-empty__icon">
              +
            </div>

            <h3>No promotions yet</h3>

            <p>
              Create your first promotion above
              to give customers another reason to
              discover your business.
            </p>
          </div>
        ) : (
          <div className="promotions-list">
            {promotions.map(
              (promotion) => (
                <article
                  key={promotion.id}
                  className="promotion-item"
                >
                  <div className="promotion-item__image">
                    {promotion.image_path ? (
                      <PromotionImage
                        path={
                          promotion.image_path
                        }
                        alt={
                          promotion.title
                        }
                        supabase={
                          supabase
                        }
                      />
                    ) : (
                      <span>
                        {promotion.title
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="promotion-item__content">
                    <div className="promotion-item__top">
                      <div>
                        <h3>
                          {promotion.title}
                        </h3>

                        <div className="promotion-item__badges">
                          {promotion.is_active ? (
                            <span className="promotion-badge promotion-badge--active">
                              Active
                            </span>
                          ) : (
                            <span className="promotion-badge">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {promotion.description && (
                      <p className="promotion-item__description">
                        {
                          promotion.description
                        }
                      </p>
                    )}

                    <div className="promotion-item__schedule">
                      <div>
                        <span>
                          Starts
                        </span>

                        <strong>
                          {formatDate(
                            promotion.starts_at,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Ends
                        </span>

                        <strong>
                          {promotion.ends_at
                            ? formatDate(
                                promotion.ends_at,
                              )
                            : "No end date"}
                        </strong>
                      </div>
                    </div>

                    <div className="promotion-item__actions">
                      <button
                        type="button"
                        className="promotions-button promotions-button--secondary"
                        onClick={() =>
                          startEditing(
                            promotion,
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="promotions-button promotions-button--danger"
                        onClick={() =>
                          handleDelete(
                            promotion,
                          )
                        }
                        disabled={
                          deletingId ===
                          promotion.id
                        }
                      >
                        {deletingId ===
                        promotion.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function PromotionImage({
  path,
  alt,
  supabase,
}: {
  path: string;
  alt: string;
  supabase: ReturnType<
    typeof createSupabaseBrowserClient
  >;
}) {
  const [url, setUrl] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadImage() {
      const { data } =
        await supabase.storage
          .from("business-media")
          .createSignedUrl(
            path,
            60 * 60,
          );

      if (
        active &&
        data?.signedUrl
      ) {
        setUrl(data.signedUrl);
      }
    }

    loadImage();

    return () => {
      active = false;
    };
  }, [path, supabase]);

  if (!url) {
    return (
      <span>
        {alt.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
    />
  );
  }
