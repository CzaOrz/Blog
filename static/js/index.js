/*
* 初始化
* */
var
    is_online = false,  // 线上环境开关
    settings_uri_offline = 'http://127.0.0.1:8866/api/settings',
    settings_uri_online = 'https://czaorz.github.io/Articles/settings.json';

function ajax(method, url, data) {
    var request = new XMLHttpRequest();
    return new Promise((success, fail) => {
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    success(request.responseText);
                } else {
                    fail(request.status)
                }
            }
        };
        request.open(method, url);
        request.send(data);
    });
}

function init() {
    var settings_uri = is_online ? settings_uri_online : settings_uri_offline;
    ajax('GET', settings_uri).then(apiData => {
        Infos = JSON.parse(apiData);
        Loading.nextUrl = Infos.blog_url;
        Loading.blogLastUrl = Infos.blog_last_url;
        loadBlog();  // 加载博客
        drawingLabelNodes(Infos.labels);  // 绘制博客标签
    })
}

document.addEventListener('DOMContentLoaded', e => {
    init();
});


/*
* 加载动画
* */
var Loading = {
        isLoading: false,
        ajaxLoading: document.querySelector('.ajax-loading'),
        nextUrl: '',
        blogLastUrl: '',
        fragmentUrl: {}
    },
    Infos = {};
Object.defineProperty(Loading, 'isLoading', {
    set(v) {
        this.value = v;
        if (v === true) {
            this.ajaxLoading.classList.remove('hidden');
        } else {
            this.ajaxLoading.classList.add('hidden');
        }
    }
});
Object.defineProperty(Loading, 'nextUrl', {
    set(v) {
        this.fragmentUrl[currentFragmentOwner] = v;
    },
    get() {
        return this.fragmentUrl[currentFragmentOwner];
    }
});


/*
* 监听滚动事件，异步加载博客
* */
var
    fragment = null,
    lastFragmentOwner = '_',
    currentFragmentOwner = '_',
    fragmentsManager = {
        _: document.createDocumentFragment()
    };

function drawing(clear = false) {
    var blogBox = document.querySelector('.blog-box');
    fragment = fragmentsManager[currentFragmentOwner];
    if (clear) {
        lastFragment = fragmentsManager[lastFragmentOwner];
        var loop = blogBox.children.length;
        for (let i = 0; i < loop; i++) {
            lastFragment.appendChild(blogBox.children[0])
        }
    }
    blogBox.appendChild(fragment);
}

function drawingBlogNodes(blogData, rolling = false) {
    if (currentFragmentOwner in fragmentsManager) {
        fragment = fragmentsManager[currentFragmentOwner];
    } else {
        fragment = fragmentsManager[currentFragmentOwner] = document.createDocumentFragment();
    }
    blogData.forEach(data => {  // todo, 僵硬，如何优化?
        var
            blog = document.createElement('div'),
            blogImgBox = document.createElement('div'),
            rightBlogLabels = document.createElement('div'),
            blogImg = document.createElement('img'),
            blogInfo = document.createElement('div'),
            blogTitle = document.createElement('a'),
            blogAbstract = document.createElement('div'),
            blogContent = document.createElement('div'),
            blogFooter = document.createElement('div'),
            blogAuthor = document.createElement('div'),
            blogCreateTime = document.createElement('div');
        blogTitle.setAttribute('href', blog.blog_url);
        blogTitle.setAttribute('target', '_blank');
        blog.style.opacity = '0';
        blog.style.transform = 'translateY(20px)';
        blog.classList.add('blog', 'right-blog-fade-in');
        blogImgBox.classList.add('blog-img-box');
        rightBlogLabels.classList.add('right-blog-labels');
        blogImg.classList.add('blog-img');
        blogInfo.classList.add('blog-info');
        blogTitle.classList.add('blog-title');
        blogAbstract.classList.add('blog-abstract');
        blogContent.classList.add('blog-content');
        blogFooter.classList.add('blog-footer');
        blogAuthor.classList.add('blog-author');
        blogCreateTime.classList.add('blog-create-time');

        data.labels.forEach(label => {
            var rightBlogLabel = document.createElement('div');
            rightBlogLabel.classList.add('right-blog-label');
            rightBlogLabel.innerText = label;
            rightBlogLabels.appendChild(rightBlogLabel);
        });
        blogImg.setAttribute('src', data.blog_img);
        blogImgBox.appendChild(rightBlogLabels);
        blogImgBox.appendChild(blogImg);
        blog.appendChild(blogImgBox);

        blogTitle.innerText = data.blog_title;
        blogAbstract.innerText = data.blog_abstract;
        blogContent.innerText = data.blog_content;
        blogInfo.appendChild(blogTitle);
        blogInfo.appendChild(blogAbstract);
        blogInfo.appendChild(blogContent);
        blog.appendChild(blogInfo);

        blogAuthor.innerText = data.blog_author;
        blogCreateTime.innerText = data.blog_created;
        blogFooter.appendChild(blogAuthor);
        blogFooter.appendChild(blogCreateTime);
        blog.appendChild(blogFooter);

        fragment.appendChild(blog);
    });
    if (currentFragmentOwner !== lastFragmentOwner) {
        if (rolling) {
            drawing();
        } else {
            drawing(true);
        }
    } else {
        drawing();
    }
}

function loadBlog() {
    if (Loading.isLoading) return;
    if (!Loading.nextUrl) return;
    Loading.isLoading = true;
    ajax('GET', Loading.nextUrl).then(appData => {
        var data = JSON.parse(appData);
        Loading.isLoading = false;
        Loading.nextUrl = data.next_url;
        drawingBlogNodes(data.blogs, true);
    });
}

function checkLoadBlog() {
    if (Loading.isLoading) return;  // 正在加载
    if (!Loading.nextUrl) return;  // 无下一条记录
    var
        winHeight = window.innerHeight,
        curHeight = document.documentElement.scrollTop,
        domHeight = document.documentElement.scrollHeight;
    if ((winHeight + curHeight + 10) > domHeight) {
        loadBlog();  // 加载博客
    }
}

document.addEventListener('scroll', e => {
    e.preventDefault();
    e.stopPropagation();
    checkLoadBlog();  //检查是否加载博客
});


/*
* 博客标签管理
* */
function drawingLabelNodes(labelData) {
    var
        leftBlogLabels = document.querySelector('.left-blog-labels'),
        fragment = document.createDocumentFragment();
    labelData.forEach(data => {
        var
            url = data.url,
            leftBlogLabel = document.createElement('div'),
            numLabel = document.createElement('span');
        leftBlogLabel.addEventListener('click', () => {
            showLabelContent(data.name, url);
        });
        leftBlogLabel.innerText = data.name;
        numLabel.innerText = data.total;
        leftBlogLabel.classList.add('left-blog-label');
        numLabel.classList.add('num-label');
        leftBlogLabel.appendChild(numLabel);
        fragment.appendChild(leftBlogLabel);
    });
    leftBlogLabels.appendChild(fragment);
}

function showLabelContent(label, url) {
    if (currentFragmentOwner === label) return;
    lastFragmentOwner = currentFragmentOwner;
    currentFragmentOwner = label;
    if (label in fragmentsManager) {
        drawing(true);
        return
    }
    ajax('GET', url).then(appData => {
        data = JSON.parse(appData);
        Loading.nextUrl = data.next_url;
        drawingBlogNodes(data.blogs);
    })
}


/*
* 顶部菜单
* */
var
    choiceNum = null,  // 选择的菜单项
    hasChoiceBool = false,
    topCircleMenuClicked = false,
    topCircleMenuMoving = false,
    topMenus = document.querySelectorAll('.top-menu'),
    topCircleMenu = document.querySelector('.top-circle-menu');
var
    addChoice = () => {  // 已选择，添加退场动画
        topCircleMenu.style.opacity = '0.5';
        topMenus.forEach((_menu, _index) => _menu.classList.add(`choice${_index + 1}`))
    },
    removeChoice = () => {  // 添加进场动画
        if (choiceNum !== null) {
            switch (choiceNum) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
            }
            choiceNum = null;
        }
        topMenus.forEach((_menu, _index) => _menu.classList.remove(`choice${_index + 1}`))
    },
    topCircleMenuMove = (e) => {  // 按钮拖拽移动
        e.stopPropagation();
        if (e.type === 'mousemove') {
            e.preventDefault();
            x = e.clientX;
            y = e.clientY;
        } else {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        }
        topCircleMenu.style.left = `${x - 26}px`;
        topCircleMenu.style.top = `${y - 26}px`;
    },
    animationToTop = () => {  // 滑动到顶部
        var timer = null;
        timer = requestAnimationFrame(function scrollToTop() {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            if (scrollTop > 4000) {
                document.body.scrollTop = document.documentElement.scrollTop = scrollTop - 200;
                requestAnimationFrame(scrollToTop);
            } else if (scrollTop > 2000) {
                document.body.scrollTop = document.documentElement.scrollTop = scrollTop - 100;
                requestAnimationFrame(scrollToTop);
            } else if (scrollTop > 0) {
                document.body.scrollTop = document.documentElement.scrollTop = scrollTop - 50;
                requestAnimationFrame(scrollToTop);
            } else {
                cancelAnimationFrame(timer);
            }
        });
    },
    animationToBottom = () => {  // 滑动到底部
        var timer = null;
        timer = requestAnimationFrame(function scrollToBottom() {
            var scrollHeight = document.body.scrollHeight,
                scrollTop = document.body.scrollTop || document.documentElement.scrollTop,
                offset = scrollHeight - scrollTop;
            if (offset > 1000) {
                document.body.scrollTop = document.documentElement.scrollTop = scrollTop + 100;
                requestAnimationFrame(scrollToBottom);
            } else {
                cancelAnimationFrame(timer);
            }
        });
    },
    forwardStep = () => {
        console.log('test');
    },
    backwardStep = () => {
        if (currentFragmentOwner !== '_') {
            lastFragmentOwner = currentFragmentOwner;
            currentFragmentOwner = '_';
            drawing(true);
        }
    };
topMenus.forEach((menu, index) => {
    menu.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (hasChoiceBool) return;
        hasChoiceBool = true;
        choiceNum = index;
        switch (index) {
            case 0:  // 前进
                setTimeout(forwardStep, 1000);
                break;
            case 1:  // 跳转顶部
                setTimeout(animationToTop, 1500);
                break;
            case 2:  // 后退
                setTimeout(backwardStep, 1000);
                break;
            case 3:  // 跳转底部
                setTimeout(animationToBottom, 1500);
                break;
        }
        setTimeout(addChoice, 500);
    });
});
topCircleMenu.addEventListener('mousedown', () => {
    topCircleMenuClicked = true;
    setTimeout(() => {
        if (!topCircleMenuClicked) return;
        topCircleMenu.classList.remove('top-menu-btn-static');
        topCircleMenuMoving = true;
        document.addEventListener('mousemove', topCircleMenuMove);
    }, 500);
});
topCircleMenu.addEventListener('mouseup', () => {
    topCircleMenuClicked = false;
    if (topCircleMenuMoving) {
        topCircleMenuMoving = false;
        document.removeEventListener('mousemove', topCircleMenuMove);
        topCircleMenu.classList.add('top-menu-btn-static');
    } else {
        topCircleMenu.style.opacity = '0';
        hasChoiceBool = false;
        setTimeout(removeChoice, 300);
    }
});
topCircleMenu.addEventListener('touchstart', e => {
    topCircleMenuClicked = true;
    setTimeout(() => {
        if (!topCircleMenuClicked) return;
        topCircleMenu.classList.remove('top-menu-btn-static');
        topCircleMenuMoving = true;
        document.addEventListener('touchmove', topCircleMenuMove);
    }, 500);
});
topCircleMenu.addEventListener('touchend', e => {
    topCircleMenuClicked = false;
    if (topCircleMenuMoving) {
        topCircleMenuMoving = false;
        document.removeEventListener('touchmove', topCircleMenuMove);
        topCircleMenu.classList.add('top-menu-btn-static');
    } else {
        topCircleMenu.style.opacity = '0';
        hasChoiceBool = false;
        setTimeout(removeChoice, 300);
    }
});

/*
* 左侧canvas
* */
var
    words = ['女票', '涨薪', '健康', '快乐', '大厂', '长胖', '锻炼', '猫咪', '帝豪', '自信', '存钱', '勇敢'],
    bg = document.querySelector('#bg'),
    ani = document.querySelector('#ani'),
    ctx_bg = bg.getContext('2d'),
    ctx_ani = ani.getContext('2d');
bg.height = ani.height = 260;
bg.width = ani.width = 260;
/* 两个圈 */
ctx_bg.beginPath();
ctx_bg.translate(130, 130);
ctx_bg.moveTo(80, 0);
ctx_bg.arc(0, 0, 80, 0, Math.PI * 2);
ctx_bg.moveTo(115, 0);
ctx_bg.arc(0, 0, 115, 0, Math.PI * 2);
ctx_bg.stroke();
/* 六芒星 */
ctx_bg.beginPath();
ctx_bg.moveTo(-69, 40);
ctx_bg.lineTo(69, 40);
ctx_bg.lineTo(0, -80);
ctx_bg.lineTo(-69, 40);
ctx_bg.moveTo(-69, -40);
ctx_bg.lineTo(69, -40);
ctx_bg.lineTo(0, 80);
ctx_bg.lineTo(-69, -40);
ctx_bg.stroke();
/* 两个红三角 */
ctx_bg.beginPath();
ctx_bg.fillStyle = 'red';
ctx_bg.moveTo(0, -125);
ctx_bg.lineTo(-5, -115);
ctx_bg.lineTo(5, -115);
ctx_bg.lineTo(0, -125);
ctx_bg.moveTo(-125, 0);
ctx_bg.lineTo(-115, 5);
ctx_bg.lineTo(-115, -5);
ctx_bg.lineTo(-125, 0);
ctx_bg.fill();

/* 生成器 */
function* loop(n) {
    var pool = [];
    for (var i = 0; i < n; i++) {
        pool.push(i);
    }
    while (1) {
        for (i of pool) {
            yield i
        }
    }
}

var
    p_rotate = Math.PI / 30,
    word_rotate = Math.PI / 2 + Math.PI / 18,
    loop2000 = loop(2000);

function clockDrawing() {
    var value = loop2000.next().value;

    ctx_ani.clearRect(0, 0, 260, 260);

    ctx_ani.save();
    ctx_ani.translate(130, 130);

    ctx_ani.save();  // 60个点
    ctx_ani.rotate(value * (Math.PI / 500));
    for (let i = 0; i < 60; i++) {
        ctx_ani.beginPath();
        ctx_ani.moveTo(120, 0);
        ctx_ani.lineTo(125, 0);
        ctx_ani.stroke();
        ctx_ani.rotate(p_rotate);
    }
    ctx_ani.restore();

    ctx_ani.save();  // 12个文字
    ctx_ani.rotate(-value * (Math.PI / 1000));
    words.forEach(word => {
        ctx_ani.rotate(Math.PI / 6);
        ctx_ani.save();
        ctx_ani.translate(85, 0);
        ctx_ani.rotate(word_rotate);
        ctx_ani.fillText(word, 5, 0);
        ctx_ani.restore();
    });
    ctx_ani.restore();

    ctx_ani.restore();
    requestAnimationFrame(clockDrawing);
}

clockDrawing();
