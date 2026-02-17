import stripe from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { NextResponse } from 'next/server';

export async function createCheckoutSession(priceId: string) {
    const ctx = getOrgContext();
    if (!ctx) throw new Error('Unauthorized');

    const { data: organization } = await createClient()
        .from('organizations')
        .select('stripe_customer_id')
        .eq('id', ctx.organizationId)
        .single();

    const session = await stripe.checkout.sessions.create({
        customer: organization?.stripe_customer_id || undefined,
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
        metadata: {
            organization_id: ctx.organizationId,
        },
    });

    return { url: session.url };
}
