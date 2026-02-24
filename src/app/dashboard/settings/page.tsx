import { getOrganization } from '@/lib/actions/organizations';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
    const organization = await getOrganization();

    return <SettingsClient organization={organization} />;
}
