class SearchRepo {
    constructor() {
        this.title = this.createTag('h1', 'title');
        this.title.textContent = 'Найти репозиторий GitHub';
        this.input = this.createTag('input', 'input');
        this.input.placeholder = 'Введи название репозитория';
        this.menu = this.createTag('div', 'menu');
        this.result = this.createTag('div', 'result');

        this.repos = {};

        this.url = 'https://api.github.com/search/repositories?q=';

        const getRepoLinkDebounce = this.debounce(this.getRepoLink, 200);

        this.input.addEventListener('input', () => { // слушает и запускает функции, которые создают выпадающее меню
            getRepoLinkDebounce(this.input.value, this.url, this.showResult, this.repos);
        });

        this.menu.addEventListener('click', (event) => {
            let repo = event.target.textContent;
            this.createElResult(this.repos[repo]);
            this.input.value = '';
            this.getRepoLink('', this.url, this.showResult, this.repos);
        });

        this.result.addEventListener('click', (event) => {
            if (event.target.textContent === 'Удалить из списка') {
                event.target.parentNode.remove();
            }
        });

    }

    debounce (fn, debounceTime) {
        let timeout;
        return function wrapper () {
            const foo = () => fn.apply(this, arguments);
            clearTimeout(timeout);
            timeout = setTimeout(foo, debounceTime);
        }
    }

    showResult (link) {
        const div = document.querySelector('.menu');
        const newEl = document.createElement('li');
        newEl.classList.add('menu-element');
        const arr = link.split('/');
        const nameRepo = arr[arr.length - 1];
        newEl.textContent = nameRepo;
        div.append(newEl);
    }

    async getRepoLink (request, url, fooShowResult, repos) { //должен возвращать ссылку на пять репозиториев
        try {
            const response = await fetch(url + request);
            const obj = await response.json();
            const li = document.querySelectorAll('.menu-element');
            if (li) {
                for (let i = 0; i < li.length; i++) {
                    li[i].remove();
                }
            }

            for (let i = 0; i < 5; i++) {
                let login = obj.items[i].owner.login;
                let stars = obj.items[i].stargazers_count;
                let linkRepo = obj.items[i].html_url;
                const arr = linkRepo.split('/');
                const nameRepo = arr[arr.length - 1];
                repos[nameRepo] = {
                    'login': login,
                    'link': linkRepo,
                    'stargazers_count': stars,
                }

                fooShowResult(linkRepo);
            }
        } catch (e) {
            if (e.name === 'TypeError') {
                console.log('Отправили на сервер пустую строку или какой-то бред.');
            }
        }
    }

    createTag (tag, className) {
        this.body = document.querySelector('body');
        this.newTag = document.createElement(tag);
        this.newTag.classList.add(className);
        this.body.append(this.newTag);
        return this.newTag;
    }

    createElResult (obj) {
        this.div = document.querySelector('.result');
        this.newEl = document.createElement('div');
        this.newEl.classList.add('result-element');
        this.newEl.innerHTML = `<p>Пользователь:</p>
                                <b>${obj.login}</b>
                                <p>Cсылка на репозиторий:</p>
                                <a href='${obj.link}'> ${obj.link}</a>
                                <p>Количество звезд: ${obj.stargazers_count}</p>
                                <button>Удалить из списка</button>`
        this.div.append(this.newEl);
    }
}

new SearchRepo()