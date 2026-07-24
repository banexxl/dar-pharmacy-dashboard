export type Product = {
     id: string;
     name: string;
     slug: string;
     description: string | null;
     main_category: string | null;
     mid_category: string | null;
     sub_category: string | null;
     available_stock: number;
     ingredients: string | null;
     instructions: string | null;
     warning: string | null;
     quantity: number | null;
     quantity_unit: string | null;
     manufacturer_id: string | null;
     image_url: string | null;
     media_urls: string[];
     price: number;
     new_arrival: boolean;
     best_seller: boolean;
     discount: boolean;
     discount_amount: number;
     is_active: boolean;
     promoting: boolean;
     promotion_text: string | null;
     display_on_home: boolean;
     created_at: string;
     updated_at: string;
     mainCategory?: string | null;
     midCategory?: string | null;
     subCategory?: string | null;
     availableStock?: number;
     quantityUnit?: string | null;
     manufacturer?: string | null;
     manufacturerURL?: string | null;
     imageURL?: string | null;
     mediaUrls?: string[];
     newArrival?: boolean;
     bestSeller?: boolean;
     discountAmount?: number;
     isActive?: boolean;
     promotionText?: string | null;
     displayOnHome?: boolean;
     createdAt?: string;
     updatedAt?: string;
};

export type ProductDraft = Partial<Product> & {
     name: string;
     description: string;
     price: number | string;
     availableStock?: number;
     available_stock?: number;
     manufacturer?: string;
     manufacturerURL?: string;
     manufacturer_id?: string | null;
     imageURL?: string;
     image_url?: string | null;
     mainCategory?: string;
     main_category?: string | null;
     midCategory?: string;
     mid_category?: string | null;
     subCategory?: string;
     sub_category?: string | null;
     quantityUnit?: string;
     quantity_unit?: string | null;
     newArrival?: boolean;
     new_arrival?: boolean;
     bestSeller?: boolean;
     best_seller?: boolean;
     discountAmount?: number;
     discount_amount?: number;
     isActive?: boolean;
     is_active?: boolean;
     promotionText?: string;
     promotion_text?: string | null;
     displayOnHome?: boolean;
     display_on_home?: boolean;
};

const toNumberOrNull = (value: unknown) => {
     if (value === '' || value === null || value === undefined) {
          return null;
     }

     const parsedValue = typeof value === 'number' ? value : Number(value);
     return Number.isNaN(parsedValue) ? null : parsedValue;
};

export const hydrateProduct = (product: Product): Product => ({
     ...product,
     mainCategory: product.mainCategory ?? product.main_category,
     midCategory: product.midCategory ?? product.mid_category,
     subCategory: product.subCategory ?? product.sub_category,
     availableStock: product.availableStock ?? product.available_stock,
     quantityUnit: product.quantityUnit ?? product.quantity_unit,
     manufacturerURL: product.manufacturerURL ?? product.manufacturer_id,
     imageURL: product.imageURL ?? product.image_url,
     mediaUrls: product.mediaUrls ?? product.media_urls,
     newArrival: product.newArrival ?? product.new_arrival,
     bestSeller: product.bestSeller ?? product.best_seller,
     discountAmount: product.discountAmount ?? product.discount_amount,
     isActive: product.isActive ?? product.is_active,
     promotionText: product.promotionText ?? product.promotion_text,
     displayOnHome: product.displayOnHome ?? product.display_on_home,
     createdAt: product.createdAt ?? product.created_at,
     updatedAt: product.updatedAt ?? product.updated_at,
});

export const hydrateProducts = (products: Product[]) => products.map(hydrateProduct);

export const normalizeProductInput = (input: Partial<ProductDraft>): Partial<Product> => ({
     id: input.id,
     name: input.name,
     slug: input.slug,
     description: input.description ?? null,
     main_category: input.main_category ?? input.mainCategory ?? null,
     mid_category: input.mid_category ?? input.midCategory ?? null,
     sub_category: input.sub_category ?? input.subCategory ?? null,
     available_stock: toNumberOrNull(input.available_stock ?? input.availableStock) ?? 0,
     ingredients: input.ingredients ?? null,
     instructions: input.instructions ?? null,
     warning: input.warning ?? null,
     quantity: toNumberOrNull(input.quantity),
     quantity_unit: input.quantity_unit ?? input.quantityUnit ?? null,
     manufacturer_id: input.manufacturer_id ?? input.manufacturerURL ?? null,
     image_url: input.image_url ?? input.imageURL ?? null,
     media_urls: input.media_urls ?? input.mediaUrls ?? [],
     price: toNumberOrNull(input.price) ?? 0,
     new_arrival: Boolean(input.new_arrival ?? input.newArrival),
     best_seller: Boolean(input.best_seller ?? input.bestSeller),
     discount: Boolean(input.discount),
     discount_amount: toNumberOrNull(input.discount_amount ?? input.discountAmount) ?? 0,
     is_active: input.is_active ?? input.isActive ?? true,
     promoting: Boolean(input.promoting),
     promotion_text: input.promotion_text ?? input.promotionText ?? null,
     display_on_home: Boolean(input.display_on_home ?? input.displayOnHome),
     created_at: input.created_at,
     updated_at: input.updated_at ?? new Date().toISOString(),
});