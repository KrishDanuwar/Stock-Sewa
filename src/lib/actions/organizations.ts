import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function getOrganization() {
    const { userId } = await auth();
    if (!userId) return null;

    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

    if (!profile) return null;

    const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

    if (!org) return null;

    return {
        id: org.id,
        name: org.name,
        pan_vat: org.pan_vat || null,
        address: org.address || null,
        phone: org.phone || null,
        logo_url: org.logo_url || null
    };
}

export async function updateOrganizationLogo(formData: FormData) {
    const supabase = await createClient();
    const file = formData.get('logo') as File;
    if (!file) return { error: 'No file provided' };

    const org = await getOrganization();
    if (!org) return { error: 'Organization not found' };

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${org.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

    if (uploadError) return { error: uploadError.message };

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

    // 3. Update Organization Table
    const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: publicUrl })
        .eq('id', org.id);

    if (updateError) return { error: updateError.message };

    return { success: true, logoUrl: publicUrl };
}

export async function updateOrganizationDetails(formData: FormData) {
    const supabase = await createClient();
    const org = await getOrganization();
    if (!org) return { error: 'Organization not found' };

    const name = formData.get('name') as string;
    const pan_vat = formData.get('pan_vat') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;

    const { error } = await supabase
        .from('organizations')
        .update({
            name,
            pan_vat,
            address,
            phone,
        })
        .eq('id', org.id);

    if (error) return { error: error.message };

    return { success: true };
}

export async function removeOrganizationLogo() {
    const supabase = await createClient();
    const org = await getOrganization();
    if (!org) return { error: 'Organization not found' };

    // 1. Get current logo path if it exists
    const currentLogoUrl = org.logo_url;
    if (currentLogoUrl) {
        try {
            const url = new URL(currentLogoUrl);
            const pathParts = url.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];

            // 2. Delete from storage
            await supabase.storage.from('logos').remove([fileName]);
        } catch (e) {
            console.error('Error parsing logo URL for deletion:', e);
        }
    }

    // 3. Update database
    const { error } = await supabase
        .from('organizations')
        .update({ logo_url: null })
        .eq('id', org.id);

    if (error) return { error: error.message };

    return { success: true };
}
