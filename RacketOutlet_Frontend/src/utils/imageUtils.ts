// utils/imageUtils.ts
export const getFinalImageUrl = (
  main_image?: string | null,
  main_image_url?: string | null
): string => {
  if (main_image) {
    return `https://wzonllfccvmvoftahudd.supabase.co/storage/v1/object/public/${main_image}`;
  }
  if (main_image_url) return main_image_url;
  return "/placeholder.png";
};
