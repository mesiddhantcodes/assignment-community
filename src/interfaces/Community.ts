import { community } from "../controllers/community.controller";

interface Community {
    id: string;
    name: string;
    slug: string;
    owner: string;
    created_at: Date;
    updated_at: Date;
}

export const validateCommunity = (community: Community): string[] => {
    if (!community.name) {
        return ["name is required"]
    }
    if (community.name.length < 3) {
        return ["name must be at least 3 characters"]
    }
    return [];

}

export default Community;