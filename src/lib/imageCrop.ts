/**
 * 画像をクロップしてBase64に変換するユーティリティ関数
 */

export interface CroppedArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * 画像をクロップしてBase64文字列として返す
 */
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: CroppedArea,
    targetSize: number = 128
): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas context not available');
    }

    // 出力サイズを設定（正方形）
    canvas.width = targetSize;
    canvas.height = targetSize;

    // 円形マスクを作成
    ctx.beginPath();
    ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();

    // クロップした画像を描画
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetSize,
        targetSize
    );

    // Base64に変換
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                resolve('');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
        }, 'image/png');
    });
}

/**
 * 画像をHTMLImageElementとして読み込む
 */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });
}
