export const uploadImage = async (fileBuffer, fileName, folder = 'products') => {
  if (!fileBuffer) {
    throw new Error('File buffer is missing. Check Multer configuration.');
  }

  const imagekit = getImageKit();

  const result = await imagekit.upload({
    file: fileBuffer.toString('base64'),
    fileName: `${Date.now()}-${fileName || 'image.jpg'}`,
    folder: `/pedi-wa-jersey/${folder}`,
    useUniqueFileName: true,
  });

  return result.url;
};