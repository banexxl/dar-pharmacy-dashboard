import { NextRequest, NextResponse } from 'next/server';
import { generateSlug } from '@/utils/generate-slug';
import { supabase } from '@/services/supabase-browser';

// ─── Table names ────────────────────────────────────────────────────────────────
const MAIN_TABLE = 'main_categories';
const MID_TABLE = 'mid_categories';
const SUB_TABLE = 'sub_categories';

type CategoryLevel = 'main' | 'mid' | 'sub';

const resolveTable = (level: CategoryLevel) => {
    switch (level) {
        case 'main': return MAIN_TABLE;
        case 'mid': return MID_TABLE;
        case 'sub': return SUB_TABLE;
    }
};

// ── GET ─────────────────────────────────────────────────────────────────────────
export async function GET() {
    try {
        const [mainResult, midResult, subResult] = await Promise.all([
            supabase.from(MAIN_TABLE).select('*').order('label', { ascending: true }),
            supabase.from(MID_TABLE).select('*').order('label', { ascending: true }),
            supabase.from(SUB_TABLE).select('*').order('label', { ascending: true }),
        ]);

        if (mainResult.error || midResult.error || subResult.error) {
            return NextResponse.json({
                error: 'Failed to fetch categories.',
                details: mainResult.error || midResult.error || subResult.error,
            }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Categories fetched!',
            data: {
                main: mainResult.data ?? [],
                mid: midResult.data ?? [],
                sub: subResult.data ?? [],
            },
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}

// ── POST ────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const level = body.level as CategoryLevel | undefined;

        if (!level || !['main', 'mid', 'sub'].includes(level)) {
            return NextResponse.json({ error: 'Missing or invalid "level" (main | mid | sub).' }, { status: 400 });
        }

        const table = resolveTable(level);
        const { label, main_category_id, mid_category_id } = body;

        if (!label || typeof label !== 'string' || !label.trim()) {
            return NextResponse.json({ error: 'Missing label.' }, { status: 400 });
        }

        const value = generateSlug(label.trim());
        const insertPayload: Record<string, unknown> = { label: label.trim(), value };

        if (level === 'mid') {
            if (!main_category_id) {
                return NextResponse.json({ error: 'Missing main_category_id for mid category.' }, { status: 400 });
            }
            insertPayload.main_category_id = main_category_id;
        }

        if (level === 'sub') {
            if (!mid_category_id) {
                return NextResponse.json({ error: 'Missing mid_category_id for sub category.' }, { status: 400 });
            }
            insertPayload.mid_category_id = mid_category_id;
        }

        const { data: created, error } = await supabase
            .from(table)
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to create category.', details: error }, { status: 500 });
        }

        return NextResponse.json({ message: 'Category created!', data: created });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}

// ── PUT ─────────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const level = body.level as CategoryLevel | undefined;

        if (!level || !['main', 'mid', 'sub'].includes(level)) {
            return NextResponse.json({ error: 'Missing or invalid "level" (main | mid | sub).' }, { status: 400 });
        }

        const table = resolveTable(level);
        const { id, label } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
        }

        const updatePayload: Record<string, string> = {};

        if (typeof label === 'string' && label.trim()) {
            updatePayload.label = label.trim();
            updatePayload.value = generateSlug(label.trim());
        }

        if (Object.keys(updatePayload).length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
        }

        const { data: updated, error } = await supabase
            .from(table)
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: 'Failed to update category.', details: error }, { status: 500 });
        }

        if (!updated) {
            return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category updated!', data: updated });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}

// ── DELETE ───────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const level = body.level as CategoryLevel | undefined;

        if (!level || !['main', 'mid', 'sub'].includes(level)) {
            return NextResponse.json({ error: 'Missing or invalid "level" (main | mid | sub).' }, { status: 400 });
        }

        const table = resolveTable(level);
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
        }

        const { data: deletedRows, error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .select('id');

        if (error) {
            return NextResponse.json({ error: 'Failed to delete category.', details: error }, { status: 500 });
        }

        if (!deletedRows || deletedRows.length === 0) {
            return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category deleted!' });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}
