"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Service = {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency_code: string | null;
  image_path: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type Props = {
  businessId: string;
  initialServices: Service[];
};

type ServiceFormState = {
  name: string;
  description: string;
  price: string;
  currencyCode: string;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: string;
};

const emptyForm: ServiceFormState = {
  name: "",
  description: "",
  price: "",
  currencyCode: "NGN",
  isAvailable: true,
  isFeatured: false,
  sortOrder: "0",
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatPrice(
  price: number | null,
  currency: string | null,
) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

  const code = currency?.trim() || "NGN";

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${code} ${price.toLocaleString()}`;
  }
}

export default function ServicesForm({
  businessId,
  initialServices,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const [services, setServices] =
    useState<Service[]>(initialServices);

  const [form, setForm] =
    useState<ServiceFormState>(emptyForm);

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
    setImagePreview(null);
  }

  function handleChange(
    field: keyof ServiceFormState,
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
        "Service images must be 5MB or smaller.",
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

  function startEditing(service: Service) {
    setEditingId(service.id);

    setForm({
      name: service.name,
      description: service.description ?? "",
      price:
        service.price === null ||
        service.price === undefined
          ? ""
          : String(service.price),
      currencyCode:
        service.currency_code?.trim() || "NGN",
      isAvailable: service.is_available,
      isFeatured: service.is_featured,
      sortOrder: String(service.sort_order),
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
    serviceId: string,
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const path =
      `${businessId}/${serviceId}/image.${extension}`;

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
      const name = form.name.trim();

      if (!name) {
        throw new Error(
          "Service name is required.",
        );
      }

      const slug = createSlug(name);

      if (!slug) {
        throw new Error(
          "Please enter a valid service name.",
        );
      }

      let price: number | null = null;

      if (form.price.trim()) {
        const parsedPrice = Number(form.price);

        if (
          !Number.isFinite(parsedPrice) ||
          parsedPrice < 0
        ) {
          throw new Error(
            "Please enter a valid service price.",
          );
        }

        price = parsedPrice;
      }

      const sortOrder = Number.parseInt(
        form.sortOrder,
        10,
      );

      if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 0
      ) {
        throw new Error(
          "Sort order must be 0 or greater.",
        );
      }

      const currencyCode =
        form.currencyCode.trim().toUpperCase();

      if (!/^[A-Z]{3}$/.test(currencyCode)) {
        throw new Error(
          "Currency code must contain exactly 3 letters.",
        );
      }

      if (editingId) {
        const {
          data: updatedService,
          error: updateError,
        } = await supabase
          .from("business_services")
          .update({
            name,
            slug,
            description:
              form.description.trim() || null,
            price,
            currency_code: currencyCode,
            is_available: form.isAvailable,
            is_featured: form.isFeatured,
            sort_order: sortOrder,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("business_id", businessId)
          .select()
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (!updatedService) {
          throw new Error(
            "Service could not be updated.",
          );
        }

        if (selectedImage) {
          const oldPath =
            updatedService.image_path;

          const newPath = await uploadImage(
            selectedImage,
            updatedService.id,
          );

          const {
            data: serviceWithImage,
            error: imageError,
          } = await supabase
            .from("business_services")
            .update({
              image_path: newPath,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", updatedService.id)
            .eq("business_id", businessId)
            .select()
            .single();

          if (imageError) {
            await deleteStorageImage(newPath);

            throw new Error(
              imageError.message,
            );
          }

          if (
            oldPath &&
            oldPath !== newPath
          ) {
            await deleteStorageImage(oldPath);
          }

          if (serviceWithImage) {
            setServices((current) =>
              current.map((item) =>
                item.id ===
                serviceWithImage.id
                  ? serviceWithImage
                  : item,
              ),
            );
          }
        } else {
          setServices((current) =>
            current.map((item) =>
              item.id ===
              updatedService.id
                ? updatedService
                : item,
            ),
          );
        }

        setMessage(
          "Service updated successfully.",
        );
      } else {
        const {
          data: createdService,
          error: insertError,
        } = await supabase
          .from("business_services")
          .insert({
            business_id: businessId,
            name,
            slug,
            description:
              form.description.trim() || null,
            price,
            currency_code: currencyCode,
            is_available: form.isAvailable,
            is_featured: form.isFeatured,
            sort_order: sortOrder,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        if (!createdService) {
          throw new Error(
            "Service could not be created.",
          );
        }

        let finalService = createdService;

        if (selectedImage) {
          const newPath = await uploadImage(
            selectedImage,
            createdService.id,
          );

          const {
            data: serviceWithImage,
            error: imageError,
          } = await supabase
            .from("business_services")
            .update({
              image_path: newPath,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", createdService.id)
            .eq("business_id", businessId)
            .select()
            .single();

          if (imageError) {
            await deleteStorageImage(newPath);

            await supabase
              .from("business_services")
              .delete()
              .eq("id", createdService.id)
              .eq("business_id", businessId);

            throw new Error(
              imageError.message,
            );
          }

          if (serviceWithImage) {
            finalService =
              serviceWithImage;
          }
        }

        setServices((current) => [
          ...current,
          finalService,
        ]);

        setMessage(
          "Service added successfully.",
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
    service: Service,
  ) {
    const confirmed = window.confirm(
      `Delete "${service.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(service.id);
    setError("");
    setMessage("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("business_services")
        .delete()
        .eq("id", service.id)
        .eq("business_id", businessId);

      if (deleteError) {
        throw new Error(
          deleteError.message,
        );
      }

      if (service.image_path) {
        await deleteStorageImage(
          service.image_path,
        );
      }

      setServices((current) =>
        current.filter(
          (item) => item.id !== service.id,
        ),
      );

      if (editingId === service.id) {
        resetForm();
      }

      setMessage(
        "Service deleted successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this service.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="services-content">
      <section className="services-card">
        <div className="services-card__header">
          <div>
            <h2>
              {editingId
                ? "Edit service"
                : "Add a service"}
            </h2>

            <p>
              Give customers clear information
              about the services you offer.
            </p>
          </div>
        </div>

        {error && (
          <div className="services-alert services-alert--error">
            {error}
          </div>
        )}

        {message && (
          <div className="services-alert services-alert--success">
            {message}
          </div>
        )}

        <form
          className="services-form"
          onSubmit={handleSubmit}
        >
          <div className="services-form__grid">
            <label className="services-field">
              <span>Service name *</span>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  handleChange(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="e.g. Interior Design"
                maxLength={120}
                required
              />
            </label>

            <label className="services-field">
              <span>Currency</span>

              <input
                type="text"
                value={form.currencyCode}
                onChange={(event) =>
                  handleChange(
                    "currencyCode",
                    event.target.value.toUpperCase(),
                  )
                }
                placeholder="NGN"
                maxLength={3}
              />
            </label>

            <label className="services-field">
              <span>Price</span>

              <input
                type="number"
                value={form.price}
                onChange={(event) =>
                  handleChange(
                    "price",
                    event.target.value,
                  )
                }
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </label>

            <label className="services-field">
              <span>Sort order</span>

              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  handleChange(
                    "sortOrder",
                    event.target.value,
                  )
                }
                min="0"
                step="1"
              />
            </label>
          </div>

          <label className="services-field">
            <span>Description</span>

            <textarea
              value={form.description}
              onChange={(event) =>
                handleChange(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Describe this service..."
              rows={5}
              maxLength={2000}
            />
          </label>

          <div className="services-field">
            <span>Service image</span>

            <div className="services-upload">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Selected service"
                  className="services-upload__preview"
                />
              ) : (
                <div className="services-upload__empty">
                  <strong>
                    Upload service image
                  </strong>

                  <span>
                    JPG, PNG or WebP · Maximum 5MB
                  </span>
                </div>
              )}

              <label className="services-upload__button">
                {selectedImage
                  ? "Change image"
                  : "Choose image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          </div>

          <div className="services-options">
            <label className="services-check">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(event) =>
                  handleChange(
                    "isAvailable",
                    event.target.checked,
                  )
                }
              />

              <span>
                <strong>Available</strong>

                <small>
                  Customers can currently
                  request this service.
                </small>
              </span>
            </label>

            <label className="services-check">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  handleChange(
                    "isFeatured",
                    event.target.checked,
                  )
                }
              />

              <span>
                <strong>
                  Featured service
                </strong>

                <small>
                  Mark this service as one
                  of your main services.
                </small>
              </span>
            </label>
          </div>

          <div className="services-form__actions">
            <button
              type="submit"
              className="services-button services-button--primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Add service"}
            </button>

            {editingId && (
              <button
                type="button"
                className="services-button services-button--secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="services-card">
        <div className="services-card__header">
          <div>
            <h2>Your services</h2>

            <p>
              {services.length === 0
                ? "You have not added any services yet."
                : `${services.length} service${
                    services.length === 1
                      ? ""
                      : "s"
                  }`}
            </p>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="services-empty">
            <div className="services-empty__icon">
              +
            </div>

            <h3>No services yet</h3>

            <p>
              Add your first service above to
              start building your business
              service catalogue.
            </p>
          </div>
        ) : (
          <div className="services-list">
            {services.map((service) => (
              <article
                key={service.id}
                className="service-item"
              >
                <div className="service-item__image">
                  {service.image_path ? (
                    <ServiceImage
                      path={service.image_path}
                      alt={service.name}
                      supabase={supabase}
                    />
                  ) : (
                    <span>
                      {service.name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="service-item__content">
                  <div className="service-item__top">
                    <div>
                      <h3>
                        {service.name}
                      </h3>

                      <div className="service-item__badges">
                        {service.is_available ? (
                          <span className="service-badge service-badge--available">
                            Available
                          </span>
                        ) : (
                          <span className="service-badge">
                            Unavailable
                          </span>
                        )}

                        {service.is_featured && (
                          <span className="service-badge service-badge--featured">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <strong className="service-item__price">
                      {formatPrice(
                        service.price,
                        service.currency_code,
                      )}
                    </strong>
                  </div>

                  {service.description && (
                    <p className="service-item__description">
                      {service.description}
                    </p>
                  )}

                  <div className="service-item__actions">
                    <button
                      type="button"
                      className="services-button services-button--secondary"
                      onClick={() =>
                        startEditing(
                          service,
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="services-button services-button--danger"
                      onClick={() =>
                        handleDelete(
                          service,
                        )
                      }
                      disabled={
                        deletingId ===
                        service.id
                      }
                    >
                      {deletingId ===
                      service.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ServiceImage({
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
