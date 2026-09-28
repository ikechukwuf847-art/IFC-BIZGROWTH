"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Product = {
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
  initialProducts: Product[];
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  currencyCode: string;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: string;
};

const emptyForm: ProductFormState = {
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

function formatPrice(price: number | null, currency: string | null) {
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

export default function ProductsForm({
  businessId,
  initialProducts,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview(null);
  }

  function handleChange(
    field: keyof ProductFormState,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
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
      setError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Product images must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function startEditing(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      description: product.description ?? "",
      price:
        product.price === null || product.price === undefined
          ? ""
          : String(product.price),
      currencyCode: product.currency_code?.trim() || "NGN",
      isAvailable: product.is_available,
      isFeatured: product.is_featured,
      sortOrder: String(product.sort_order),
    });

    setSelectedImage(null);
    setImagePreview(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadImage(file: File, productId: string) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path = `${businessId}/${productId}/image.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-media")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    return path;
  }

  async function deleteStorageImage(path: string | null) {
    if (!path) {
      return;
    }

    await supabase.storage
      .from("product-media")
      .remove([path]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const name = form.name.trim();

      if (!name) {
        throw new Error("Product name is required.");
      }

      const slug = createSlug(name);

      if (!slug) {
        throw new Error("Please enter a valid product name.");
      }

      let price: number | null = null;

      if (form.price.trim()) {
        const parsedPrice = Number(form.price);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
          throw new Error("Please enter a valid product price.");
        }

        price = parsedPrice;
      }

      const sortOrder = Number.parseInt(form.sortOrder, 10);

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        throw new Error("Sort order must be 0 or greater.");
      }

      const currencyCode =
        form.currencyCode.trim().toUpperCase();

      if (!/^[A-Z]{3}$/.test(currencyCode)) {
        throw new Error(
          "Currency code must contain exactly 3 letters.",
        );
      }

      let productId = editingId;

      if (editingId) {
        const { data: updatedProduct, error: updateError } =
          await supabase
            .from("business_products")
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
              updated_at: new Date().toISOString(),
            })
            .eq("id", editingId)
            .eq("business_id", businessId)
            .select()
            .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (!updatedProduct) {
          throw new Error("Product could not be updated.");
        }

        productId = updatedProduct.id;

        if (selectedImage) {
          const oldPath = updatedProduct.image_path;

          const newPath = await uploadImage(
            selectedImage,
            updatedProduct.id,
          );

          const { data: productWithImage, error: imageError } =
            await supabase
              .from("business_products")
              .update({
                image_path: newPath,
                updated_at: new Date().toISOString(),
              })
              .eq("id", updatedProduct.id)
              .eq("business_id", businessId)
              .select()
              .single();

          if (imageError) {
            await deleteStorageImage(newPath);
            throw new Error(imageError.message);
          }

          if (oldPath && oldPath !== newPath) {
            await deleteStorageImage(oldPath);
          }

          if (productWithImage) {
            setProducts((current) =>
              current.map((item) =>
                item.id === productWithImage.id
                  ? productWithImage
                  : item,
              ),
            );
          }
        } else {
          setProducts((current) =>
            current.map((item) =>
              item.id === updatedProduct.id
                ? updatedProduct
                : item,
            ),
          );
        }

        setMessage("Product updated successfully.");
      } else {
        const { data: createdProduct, error: insertError } =
          await supabase
            .from("business_products")
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

        if (!createdProduct) {
          throw new Error("Product could not be created.");
        }

        productId = createdProduct.id;

        let finalProduct = createdProduct;

        if (selectedImage) {
          const newPath = await uploadImage(
            selectedImage,
            createdProduct.id,
          );

          const { data: productWithImage, error: imageError } =
            await supabase
              .from("business_products")
              .update({
                image_path: newPath,
                updated_at: new Date().toISOString(),
              })
              .eq("id", createdProduct.id)
              .eq("business_id", businessId)
              .select()
              .single();

          if (imageError) {
            await deleteStorageImage(newPath);

            await supabase
              .from("business_products")
              .delete()
              .eq("id", createdProduct.id)
              .eq("business_id", businessId);

            throw new Error(imageError.message);
          }

          if (productWithImage) {
            finalProduct = productWithImage;
          }
        }

        setProducts((current) => [
          ...current,
          finalProduct,
        ]);

        setMessage("Product added successfully.");
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

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);
    setError("");
    setMessage("");

    try {
      const { error: deleteError } = await supabase
        .from("business_products")
        .delete()
        .eq("id", product.id)
        .eq("business_id", businessId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      if (product.image_path) {
        await deleteStorageImage(product.image_path);
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );

      if (editingId === product.id) {
        resetForm();
      }

      setMessage("Product deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this product.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="products-content">
      <section className="products-card">
        <div className="products-card__header">
          <div>
            <h2>
              {editingId ? "Edit product" : "Add a product"}
            </h2>

            <p>
              Give customers clear information about what you
              offer.
            </p>
          </div>
        </div>

        {error && (
          <div className="products-alert products-alert--error">
            {error}
          </div>
        )}

        {message && (
          <div className="products-alert products-alert--success">
            {message}
          </div>
        )}

        <form
          className="products-form"
          onSubmit={handleSubmit}
        >
          <div className="products-form__grid">
            <label className="products-field">
              <span>Product name *</span>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  handleChange(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="e.g. Executive Office Chair"
                maxLength={120}
                required
              />
            </label>

            <label className="products-field">
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

            <label className="products-field">
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

            <label className="products-field">
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

          <label className="products-field">
            <span>Description</span>

            <textarea
              value={form.description}
              onChange={(event) =>
                handleChange(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Describe this product..."
              rows={5}
              maxLength={2000}
            />
          </label>

          <div className="products-field">
            <span>Product image</span>

            <div className="products-upload">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Selected product"
                  className="products-upload__preview"
                />
              ) : (
                <div className="products-upload__empty">
                  <strong>Upload product image</strong>
                  <span>
                    JPG, PNG or WebP · Maximum 5MB
                  </span>
                </div>
              )}

              <label className="products-upload__button">
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

          <div className="products-options">
            <label className="products-check">
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
                  Customers can currently order or ask
                  about this product.
                </small>
              </span>
            </label>

            <label className="products-check">
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
                <strong>Featured product</strong>
                <small>
                  Mark this product as one of your main
                  products.
                </small>
              </span>
            </label>
          </div>

          <div className="products-form__actions">
            <button
              type="submit"
              className="products-button products-button--primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Add product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="products-button products-button--secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="products-card">
        <div className="products-card__header">
          <div>
            <h2>Your products</h2>

            <p>
              {products.length === 0
                ? "You have not added any products yet."
                : `${products.length} product${
                    products.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="products-empty">
            <div className="products-empty__icon">+</div>

            <h3>No products yet</h3>

            <p>
              Add your first product above to start building
              your business catalogue.
            </p>
          </div>
        ) : (
          <div className="products-list">
            {products.map((product) => (
              <article
                key={product.id}
                className="product-item"
              >
                <div className="product-item__image">
                  {product.image_path ? (
                    <ProductImage
                      path={product.image_path}
                      alt={product.name}
                      supabase={supabase}
                    />
                  ) : (
                    <span>
                      {product.name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="product-item__content">
                  <div className="product-item__top">
                    <div>
                      <h3>{product.name}</h3>

                      <div className="product-item__badges">
                        {product.is_available ? (
                          <span className="product-badge product-badge--available">
                            Available
                          </span>
                        ) : (
                          <span className="product-badge">
                            Unavailable
                          </span>
                        )}

                        {product.is_featured && (
                          <span className="product-badge product-badge--featured">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <strong className="product-item__price">
                      {formatPrice(
                        product.price,
                        product.currency_code,
                      )}
                    </strong>
                  </div>

                  {product.description && (
                    <p className="product-item__description">
                      {product.description}
                    </p>
                  )}

                  <div className="product-item__actions">
                    <button
                      type="button"
                      className="products-button products-button--secondary"
                      onClick={() =>
                        startEditing(product)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="products-button products-button--danger"
                      onClick={() =>
                        handleDelete(product)
                      }
                      disabled={
                        deletingId === product.id
                      }
                    >
                      {deletingId === product.id
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

function ProductImage({
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
  const [url, setUrl] = useState<string | null>(null);

  useState(() => {
    let active = true;

    supabase.storage
      .from("product-media")
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (active && data?.signedUrl) {
          setUrl(data.signedUrl);
        }
      });

    return () => {
      active = false;
    };
  });

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
