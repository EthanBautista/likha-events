# Cloudinary upload preset

Photos the owner adds in the editor page (`/admin`) upload straight to the business's Cloudinary account through Cloudinary's Media Library (ADR 0002). An upload preset, set as the Media Library's default for images, shrinks each photo to at most 2500px wide as it arrives, so a 4000px phone photo is stored at about a third of its size. The site never needs anything bigger: it asks Cloudinary for each photo at the width the screen needs (`cloudinaryUrlAtWidth` in `src/photos.ts`).

The preset lives in Cloudinary, not in this repo. These are its settings, so it can be recreated.

## Settings

| Setting | Value |
| --- | --- |
| Name | `likha-shrink-on-upload` |
| Signing mode | Signed (the owner is logged in to the Media Library, so uploads don't need to be unsigned) |
| Incoming transformation | Resize with mode **Limit**, width **2500**, no height. As a URL transformation: `c_limit,w_2500` |
| Everything else | Left at Cloudinary's defaults |

**Limit** shrinks a photo wider than 2500px and leaves a narrower one alone, never enlarging it or cropping it. A tall phone photo keeps its shape, so it ends up 2500px wide and taller than that.

## Recreating it

In the Cloudinary console, signed in to the business's account:

1. Open **Settings › Upload › Upload presets** (`https://console.cloudinary.com/app/settings/upload/presets`) and choose **Add upload preset**.
2. Name it `likha-shrink-on-upload` and keep signing mode **Signed**.
3. Under **Transform**, set the **Incoming transformation** to resize with mode **Limit** and width **2500**, then save.
4. Back on the Upload presets page, choose **Manage Defaults** and set `likha-shrink-on-upload` as the default **Media Library** preset for **images**.

## Checking it works

Upload a photo from a phone in the editor page, then open it in the Cloudinary console. Its width should be 2500px or less. If it's still full size, the preset isn't the Media Library's default for images, or a different preset was picked in the upload dialog. A preset picked there overrides the default.
