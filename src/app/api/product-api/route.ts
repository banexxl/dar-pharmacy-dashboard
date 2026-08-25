import { NextRequest, NextResponse } from 'next/server';
import { generateSlug } from '@/utils/generate-slug';
import { supabaseBrowser as supabase } from '@/services/supabase-browser';
import { Product } from '@/schemas/product';
import { submitSitemapIfProduction } from '@/lib/google/search-console';

const toNumberOrNull = (value: unknown) => {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const parsedValue = typeof value === 'number' ? value : Number(value);
    return Number.isNaN(parsedValue) ? null : parsedValue;
};

const mapProductPayload = (payload: Record<string, any>): Partial<Product> => ({
    id: payload.id,
    name: payload.name,
    slug: payload.slug,
    description: payload.description ?? null,
    main_category: payload.main_category ?? null,
    mid_category: payload.mid_category ?? null,
    sub_category: payload.sub_category ?? null,
    available_stock: toNumberOrNull(payload.available_stock) ?? 0,
    ingredients: payload.ingredients ?? null,
    instructions: payload.instructions ?? null,
    warning: payload.warning ?? null,
    quantity: toNumberOrNull(payload.quantity),
    quantity_unit: payload.quantity_unit ?? null,
    manufacturer_id: payload.manufacturer_id ?? null,
    image_url: payload.image_url ?? null,
    media_urls: Array.isArray(payload.media_urls) ? payload.media_urls : [],
    price: toNumberOrNull(payload.price) ?? 0,
    new_arrival: Boolean(payload.new_arrival),
    best_seller: Boolean(payload.best_seller),
    discount: Boolean(payload.discount),
    discount_amount: toNumberOrNull(payload.discount_amount) ?? 0,
    is_active: payload.is_active ?? true,
    promoting: Boolean(payload.promoting),
    promotion_text: payload.promotion_text ?? null,
    display_on_home: Boolean(payload.display_on_home),
    created_at: payload.created_at,
    updated_at: payload.updated_at ?? new Date().toISOString(),
});

// ── GET ─────────────────────────────────────────────────────────────────────────
export async function GET() {
    try {
        const { data: allProducts, error } = await supabase
            .from('products')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Products found!', data: allProducts ?? [] });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}

// ── POST ────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const slug = generateSlug(body.name);
        const newProduct = mapProductPayload({ ...body, slug });

        const { data, error } = await supabase
            .from('products')
            .insert(newProduct)
            .select('*')
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to add product.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Product successfully added!', data });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}

// ── PUT ─────────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const slug = generateSlug(body.name);
        const rawId = body.id;

        // Fetch current state to detect activation transition
        const { data: existingProduct } = await supabase
            .from('products')
            .select('is_active')
            .eq('id', rawId)
            .maybeSingle();

        const updatePayload = mapProductPayload({ ...body, slug });

        let updateResult = await supabase
            .from('products')
            .update(updatePayload)
            .eq('id', rawId)
            .select('*')
            .single();

        if ((!updateResult.data || updateResult.error) && body.slug) {
            updateResult = await supabase
                .from('products')
                .update(updatePayload)
                .eq('slug', body.slug)
                .select('*')
                .maybeSingle();
        }

        if (updateResult.error) {
            return NextResponse.json({ error: 'Error updating product.' }, { status: 500 });
        }

        if (!updateResult.data) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        // Submit sitemap on inactive → active transition
        const wasInactive = existingProduct && !existingProduct.is_active;
        const isNowActive = updateResult.data.is_active === true;

        if (wasInactive && isNowActive) {
            try {
                await submitSitemapIfProduction();
            } catch {
                // Never fail the request due to sitemap submission
            }
        }

        return NextResponse.json({ message: 'Product successfully updated!', data: updateResult.data });
    } catch {
        return NextResponse.json({ error: 'Error updating product.' }, { status: 500 });
    }
}

// ── DELETE ───────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const currentProductID = body.currentProductID;

        const { data, error } = await supabase
            .from('products')
            .delete()
            .eq('id', currentProductID)
            .select('id');

        if (error) {
            return NextResponse.json({ error: 'Error deleting product.' }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Product successfully deleted!' });
    } catch {
        return NextResponse.json({ error: 'Error deleting product.' }, { status: 500 });
    }
}
