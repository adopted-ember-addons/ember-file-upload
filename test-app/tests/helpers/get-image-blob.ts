export default function getImageBlob(): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.toBlob(resolve, 'image/png');
  });
}
