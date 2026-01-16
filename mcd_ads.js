/**
 * 麦当劳布局净化脚本 - cmkachun
 * 策略：保留功能模块，仅抹除明确的广告数据
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);

        if (url.includes("/bff/portal/home")) {
            if (obj.data && obj.data.sections) {
                // 仅物理删除明确的视频/开屏容器
                const hardBlacklist = ["video", "splash", "indexvideo"];
                obj.data.sections = obj.data.sections.filter(s => {
                    const name = (s.sectionName || "").toLowerCase();
                    const type = (s.sectionType || "").toLowerCase();
                    return !hardBlacklist.some(k => name.includes(k) || type.includes(k));
                });
            }
        }

        // 深度清理：将指向广告目录的链接替换为占位图
        const cleanUrls = (target) => {
            if (typeof target === 'string') {
                const lower = target.toLowerCase();
                // 拦截明确带有 splash/pop/adv 路径且不含日历关键字的链接
                if (lower.includes("img.mcd.cn") && 
                   (lower.includes("splash") || lower.includes("pop") || lower.includes("adv")) && 
                   !lower.includes("calendar")) {
                    return "https://raw.githubusercontent.com/cmkachun/mcdad/main/pixel.png";
                }
            } else if (Array.isArray(target)) {
                return target.map(cleanUrls);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    target[key] = cleanUrls(target[key]);
                }
            }
            return target;
        };
        obj = cleanUrls(obj);

        body = JSON.stringify(obj);
    } catch (e) {
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
