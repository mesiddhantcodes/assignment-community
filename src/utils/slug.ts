// const slug = community.name.toLowerCase().replace(/ /g, '-');
import { MongoClient, Db } from 'mongodb';
function generateSlug(name: string): string {
    return name
        .toLowerCase() 
        .replace(/\s+/g, '-') 
        .replace(/[^a-z0-9-]/g, ''); 
}
export async function generateUniqueSlug(db:Db, name: string): Promise<string> {
    const tempslug = generateSlug(name);
    let slug = tempslug;
    let count = 1;
    const communites = db.collection('communities');
    while (true) {
        const existingCommunity = await communites.findOne({ tempslug });
        if (!existingCommunity) {
            return tempslug;
        }
        slug = `${tempslug}-${count}`;
        count++;
    }
}
