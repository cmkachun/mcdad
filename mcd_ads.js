/**
 * 麦当劳图片分流过滤脚本 - cmkachun
 * 策略：识别开屏大图并拦截，放行 UI 小图标
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 递归处理函数
        const filterImages = (target) => {
            if (typeof target === 'string') {
                // 只有指向 img.mcd.cn 的链接才处理
                if (target.includes("img.mcd.cn")) {
                    // 1. 明确的广告图 ID（你之前抓到的那几个）
                    const adIds = ["dd9407f36a1db737", "3c6b06647db3f7f1"];
                    // 2. 路径中包含 splash(开屏) 或 pop(弹窗) 的大图
                    const isLargeAd = target.includes("splash") || target.includes("pop") || adIds.some(id => target.includes(id));
                    
                    if (isLargeAd) {
                        console.log(`cmkachun: 已拦截预下载大图: ${target}`);
                        return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                    }
                    // 3. UI图标（拇指大小的图）通常包含 "icon", "menu", "logo" 等词，或者不含广告特征，直接放行
                }
            } else if (Array.isArray(target)) {
                return target.map(filterImages);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    target[key] = filterImages(target[key]);
                }
            }
            return target;
        };

        // 执行过滤
        obj = filterImages(obj);

        // 彻底移除首页的广告 Section 容器，防止出现空白框
        if (obj.data && obj.data.sections) {
            const blacklist = ["video", "banner", "splash", "adv", "pop", "marketing"];
            obj.data.sections = obj.data.sections.filter(s => {
                const name = (s.sectionName || "").toLowerCase();
                return !blacklist.some(k => name.includes(k));
            });
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 兜底只破坏 mp4
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
