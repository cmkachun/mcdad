/**
 * 麦当劳稳定去广告脚本 - cmkachun
 * 目标：解决 api2 域名下的空白占位和视频闪现
 */

let body = $response.body;
let url = $request.url;

if (body) {
    try {
        let obj = JSON.parse(body);
        const adKeywords = ["video", "splash", "adv", "banner", "hot", "pop", "float"];

        // 递归清理函数：扫描所有层级，删除匹配的 Key
        const deepClean = (target) => {
            if (Array.isArray(target)) {
                return target.filter(item => {
                    const name = (item.sectionName || item.moduleName || "").toLowerCase();
                    return !adKeywords.some(k => name.includes(k));
                }).map(deepClean);
            } else if (typeof target === 'object' && target !== null) {
                for (let key in target) {
                    target[key] = deepClean(target[key]);
                }
            }
            return target;
        };

        // 执行清理逻辑
        if (obj.data) {
            obj.data = deepClean(obj.data);
        }
        
        // 强制同步 audit 状态
        if (obj.hasOwnProperty('audit')) obj.audit = true;

        body = JSON.stringify(obj);
    } catch (e) {
        // 兜底：抹除所有 mp4 链接
        body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");
    }
}

$done({ body });
