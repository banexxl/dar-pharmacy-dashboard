import { NextRequest, NextResponse } from 'next/server';
import { generateSlug } from '@/utils/generate-slug';
import { supabase } from '@/services/supabase-browser';

const MANUFACTURERS_TABLE = 'manufacturers';

// ── GET ─────────────────────────────────────────────────────────────────────────
export async function GET() {
    try {
        const { data: manufacturers, error } = await supabase
            .from(MANUFACTURERS_TABLE)
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch manufacturers.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Manufacturers found!', data: manufacturers });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}

// ── POST ────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const { name, value, url } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Missing name.' }, { status: 400 });
        }

        const finalValue = value || generateSlug(name);

        const { data: createdManufacturer, error } = await supabase
            .from(MANUFACTURERS_TABLE)
            .insert({ name, value: finalValue, url: url || '' })
            .select('*')
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to create manufacturer.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Manufacturer successfully created!', data: createdManufacturer });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}

// ── PUT ─────────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
    try {
        const { id, name, value, url } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
        }

        const updatePayload: Record<string, string> = {};
        if (typeof name === 'string') updatePayload.name = name;
        if (typeof value === 'string') updatePayload.value = value;
        if (typeof url === 'string') updatePayload.url = url;

        if (Object.keys(updatePayload).length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
        }

        const { data: updatedManufacturer, error } = await supabase
            .from(MANUFACTURERS_TABLE)
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: 'Failed to update manufacturer.' }, { status: 500 });
        }

        if (!updatedManufacturer) {
            return NextResponse.json({ error: 'Manufacturer not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Manufacturer successfully updated!', data: updatedManufacturer });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}

// ── DELETE ───────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
        }

        const { data: deletedRows, error } = await supabase
            .from(MANUFACTURERS_TABLE)
            .delete()
            .eq('id', id)
            .select('id');

        if (error) {
            return NextResponse.json({ error: 'Failed to delete manufacturer.' }, { status: 500 });
        }

        if (!deletedRows || deletedRows.length === 0) {
            return NextResponse.json({ error: 'Manufacturer not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Manufacturer successfully deleted!' });
    } catch {
        return NextResponse.json({ error: 'Internal server error!' }, { status: 500 });
    }
}
