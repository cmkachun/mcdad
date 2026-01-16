/**
 * 麦当劳通用去广告脚本 - cmkachun
 * 逻辑：不依赖具体地址，直接通过关键词和后缀过滤
 */

let body = $response.body;

if (body) {
    // 1. 暴力正则：把 body 里所有指向 img.mcd.cn 的 mp4 链接全部替换成空
    // 这样即便地址变了，只要后缀是 .mp4，App 就拿不到正确的下载链接
    body = body.replace(/https?:\/\/img\.mcd\.cn\/[^"\s]+\.mp4/g, "");

    try {
        let obj = JSON.parse(body);
        
        // 2. 遍历所有模块，只要包含广告、视频、弹窗字样的，全部干掉
        if (obj.data && obj.data.modules) {
            const blacklist = ["splash", "ad", "video", "pop", "guide", "loading"];
            obj.data.modules = obj.data.modules.filter(m => {
                const name = (m.moduleName || "").toLowerCase();
                return !blacklist.some(keyword => name.includes(keyword));
            });
        }

        // 3. 针对某些版本，把所有的资源版本号设为 0，诱骗 App 不去下载新物料
        if (obj.rvs) {
            obj.rvs.forEach(item => item.rv = "0");
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // 如果不是 JSON，维持正则替换后的 body 即可
    }
}

$done({ body });
