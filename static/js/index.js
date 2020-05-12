var ajaxLoading = document.querySelector('.ajax-loading'),
    topCircleMenu = document.querySelector('.top-circle-menu');


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
        blog.classList.add('blog');
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


document.addEventListener('DOMContentLoaded', e => {
    ajax('GET', 'http://127.0.0.1:8866/api/blog').then(appData => {
        // drawingBlogNodes(JSON.parse(appData).blogs);
    });
});
