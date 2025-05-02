import Tag from "../../../models/Tag";

const getTagIdsByNames = async (tagNames: string[]): Promise<string[]> => {
  const tagsId: string[] = [];
  for (const tag of tagNames) {
    const tagDoc = await Tag.findOne({ name: tag });
    if (!tagDoc) throw new Error(`TagNotFound:${tag}`);
    tagsId.push(tagDoc._id as string);
  }
  return tagsId;
};

export default getTagIdsByNames;
