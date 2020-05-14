var
    hasChoice = null,
    hasChoiceBool = false,
    topMenus = document.querySelectorAll('.top-menu'),
    topCircleMenu = document.querySelector('.top-circle-menu'),
    addChoice = () => {
        topCircleMenu.style.opacity = '0.5';
        topMenus.forEach((_menu, _index) => _menu.classList.add(`choice${_index + 1}`))
    },
    removeChoice = () => {
        if (hasChoice !== null) {
            switch (hasChoice) {
                case 0:
                    break;
                case 1:
                    break;
            }
            hasChoice = null;
        }
        topMenus.forEach((_menu, _index) => _menu.classList.remove(`choice${_index + 1}`))
    };
var Loading = {
        isLoading: false,
        ajaxLoading: document.querySelector('.ajax-loading'),
        nextUrl: '',
        blogLastUrl: ''
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
    },
    get() {
        return this.value;
    }
});

function init() {
    ajax('GET', 'http://127.0.0.1:8866/api/settings').then(apiData => {
        Infos = JSON.parse(apiData);
        Loading.nextUrl = Infos.blog_url;
        Loading.blogLastUrl = Infos.blog_last_url;
        loadBlog();
        drawingLabelNodes(Infos.labels);
    })
}

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

function drawingLabelNodes(labelData) {
    console.log(labelData);
    var
        leftBlogLabels = document.querySelector('.left-blog-labels'),
        fragment = document.createDocumentFragment();
    labelData.forEach(data => {
        var
            leftBlogLabel = document.createElement('a'),
            numLabel = document.createElement('span');
        leftBlogLabel.setAttribute('href', data.url);
        leftBlogLabel.innerText = data.name;
        numLabel.innerText = data.total;
        leftBlogLabel.classList.add('left-blog-label');
        numLabel.classList.add('num-label');
        leftBlogLabel.appendChild(numLabel);
        fragment.appendChild(leftBlogLabel);
    });
    leftBlogLabels.appendChild(fragment);
}

function drawingBlogNodes(blogData) {
    var
        blogBox = document.querySelector('.blog-box'),
        fragment = document.createDocumentFragment();
    blogData.forEach(data => {
        var
            blog = document.createElement('div'),
            blogImgBox = document.createElement('div'),
            rightBlogLabels = document.createElement('div'),
            rightBlogLabel = document.createElement('div'),
            blogImg = document.createElement('img'),
            blogInfo = document.createElement('div'),
            blogTitle = document.createElement('div'),
            blogAbstract = document.createElement('div'),
            blogContent = document.createElement('div'),
            blogFooter = document.createElement('div'),
            blogAuthor = document.createElement('div'),
            blogCreateTime = document.createElement('div');
        blog.style.opacity = '0';
        blog.style.transform = 'translateY(20px)';
        blog.classList.add('blog', 'right-blog-fade-in');
        blogImgBox.classList.add('blog-img-box');
        rightBlogLabels.classList.add('right-blog-labels');
        rightBlogLabel.classList.add('right-blog-label');
        blogImg.classList.add('blog-img');
        blogInfo.classList.add('blog-info');
        blogTitle.classList.add('blog-title');
        blogAbstract.classList.add('blog-abstract');
        blogContent.classList.add('blog-content');
        blogFooter.classList.add('blog-footer');
        blogAuthor.classList.add('blog-author');
        blogCreateTime.classList.add('blog-create-time');

        rightBlogLabel.innerText = data.labels[0];
        blogImg.setAttribute('src', data.blog_img);
        rightBlogLabels.appendChild(rightBlogLabel);
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
    blogBox.appendChild(fragment);
}

function loadBlog() {
    if (Loading.isLoading) return;
    if (!Loading.nextUrl) return;
    Loading.isLoading = true;
    ajax('GET', Loading.nextUrl).then(appData => {
        var data = JSON.parse(appData);
        Loading.isLoading = false;
        Loading.nextUrl = data.next_url;
        drawingBlogNodes(data.blogs);
    });
}

function checkLoadBlog() {
    if (Loading.isLoading) return;
    if (!Loading.nextUrl) return;
    var
        winHeight = window.innerHeight,
        curHeight = document.documentElement.scrollTop,
        domHeight = document.documentElement.scrollHeight;
    if ((winHeight + curHeight + 10) > domHeight) {
        loadBlog();
    }
}

document.addEventListener('DOMContentLoaded', e => {
    init();
});

document.addEventListener('scroll', e => {
    e.preventDefault();
    e.stopPropagation();
    checkLoadBlog();
});

topMenus.forEach((menu, index) => {
    menu.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (hasChoiceBool) return;
        hasChoiceBool = true;
        switch (index) {
            case 0:
                hasChoice = index;
                break;
            case 1:
                hasChoice = index;
                break;
        }
        setTimeout(addChoice, 500);
    });
});
var
    topCircleMenuClicked = false,
    topCircleMenuMoving = false;

function topCircleMenuMove(e) {
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
}

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
topCircleMenu.addEventListener('touchstart', () => {
    topCircleMenuClicked = true;
    setTimeout(() => {
        if (!topCircleMenuClicked) return;
        topCircleMenu.classList.remove('top-menu-btn-static');
        topCircleMenuMoving = true;
        document.addEventListener('touchmove', topCircleMenuMove);
    }, 500);
});
topCircleMenu.addEventListener('touchend', () => {
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
