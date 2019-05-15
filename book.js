(function () {

    class Book {

        loggedInUser = '';
        idCounter = 0;
        data = [];
        constructor() {
            console.log('constructor called');

            document.addEventListener('click', (event) => {

                if (event.target.classList.contains('login')) {
                    this.login();
                    this.showGrid();

                }

                if (event.target.classList.contains('logout')) {
                    this.logout();
                    this.showGrid();
                }

                if (event.target.classList.contains('addBook')) {
                    this.addBook();
                    this.showGrid();
                }

                if (event.target.classList.contains('deleteBook')) {
                    this.deleteBook(event);
                    this.showGrid();
                }

                if (event.target.classList.contains('borrowBook')) {
                    this.borrowBook(event);
                    this.showGrid();
                }

                if (event.target.classList.contains('returnBook')) {
                    this.returnBook(event);
                    this.showGrid();
                }

                if (event.target.classList.contains('requestNext')) {
                    this.requestNext(event);
                    this.showGrid();
                }

            });

            this.showGrid();


            setInterval(() => {

                let flag = false;
                for (const o of this.data) {
                    if(o.returnTime != '' && o.returnTime <= new Date().getTime()){
                        o.borrower = '';
                        o.borrowTime = '';
                        o.returnTime = '';
                        if(o.requestNext != ''){
                            o.requestNextExpiry = new Date().setSeconds(new Date().getSeconds() + 10);
                        }
                        flag = true;
                    }else if(o.borrower == '' && o.requestNext != ''){
                        // console.log(o.requestNextExpiry <= new Date().getTime());
                        if(o.requestNextExpiry <= new Date().getTime()){
                            o.requestNext = '';
                            o.requestNextExpiry = '';
                            flag = true;
                        }
                    }
                }

                if(flag) {
                    this.showGrid();
                }
                

            }, 1000);

        }

        // Function to show Grid
        showGrid() {
            const header = ['id', 'title', 'author', 'lender', 'borrower', 'action'];

            const grid = document.getElementById('grid');
            grid.innerHTML = '';

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            let tr = document.createElement('tr');
            for (const o of header) {
                let th = document.createElement('th');
                th.innerHTML = this.capitalize(o);
                tr.append(th);
            }

            thead.append(tr);
            table.append(thead);

            let td;
            for (const obj of this.data) {
                tr = document.createElement('tr');
                for (const head of header) {
                    td = document.createElement('td');
                    if (head != 'action') {
                        td.innerHTML = obj[head] || '-';
                    } else {
                        if (this.loggedInUser != "" && this.loggedInUser == obj.lender) {
                            td.innerHTML = `
                                <input type="button" id="deleteBook" class="deleteBook" value="Delete" alt="Delete" data-id="${obj.id}" />
                            `;
                        } else if (this.loggedInUser != "" && this.loggedInUser != obj.lender && obj.borrower == '' && obj.requestNext == '') {
                            td.innerHTML = `
                                <input type="button" id="borrowBook" class="borrowBook" value="Borrow" alt="Borrow" data-id="${obj.id}" />
                            `;
                        } else if (this.loggedInUser != "" && this.loggedInUser != obj.lender && obj.borrower == this.loggedInUser) {
                            td.innerHTML = `
                                <input type="button" id="returnBook" class="returnBook" value="Return" alt="Return" data-id="${obj.id}" />
                            `;
                        } else if (this.loggedInUser != "" && this.loggedInUser != obj.lender && obj.borrower != '' && obj.requestNext == '') {
                            td.innerHTML = `
                                <input type="button" id="requestNext" class="requestNext" value="Request Next" alt="Request Next" data-id="${obj.id}" />
                            `;
                        } else if ((obj.borrower != '' && obj.requestNext != '') || (obj.borrower == '' && obj.requestNext != '' && obj.requestNext != this.loggedInUser)) {
                            td.innerHTML = `
                                Requested by ${obj.requestNext}
                            `;
                        } else if (this.loggedInUser != "" && this.loggedInUser != obj.lender && obj.borrower == '' && obj.requestNext == this.loggedInUser) {
                            td.innerHTML = `
                            <input type="button" id="borrowBook" class="borrowBook" value="Borrow" alt="Borrow" data-id="${obj.id}" />
                            `;
                        } else {
                            td.innerHTML = '-';
                        }
                    }
                    tr.append(td);
                }
                tbody.append(tr);
            }



            tr = document.createElement('tr');
            if (this.loggedInUser != '') {

                tr.innerHTML = `
                    <td>${this.idCounter + 1}</td>
                    <td>
                        <input type="text" id="title" class="title" placeholder="title" />
                    </td>
                    <td>
                        <input type="text" id="author" class="author" placeholder="author" />
                    </td>
                    <td>
                        ${this.loggedInUser}
                    </td>
                    <td>
                        -
                    </td>
                    <td>
                        <input type="button" id="addBook" class="addBook" value="Add Book" />
                    </td>
                `;

                tbody.append(tr);
            }



            table.append(tbody);
            grid.append(table);
        }

        capitalize(value) {
            return value[0].toUpperCase() + value.slice(1);
        }

        login() {
            const name = document.getElementById('userName');
            const login = document.getElementById('login');
            const logout = document.getElementById('logout');

            this.loggedInUser = name.value;

            name.classList.add('disable');
            login.classList.add('hide');
            logout.classList.remove('hide');
        }

        logout() {
            const name = document.getElementById('userName');
            const login = document.getElementById('login');
            const logout = document.getElementById('logout');

            this.loggedInUser = '';
            name.value = '';

            name.classList.remove('disable');
            login.classList.remove('hide');
            logout.classList.add('hide');
        }

        addBook() {
            const title = document.getElementById('title');
            const author = document.getElementById('author');

            this.data.push({
                id: ++this.idCounter,
                title: title.value,
                author: author.value,
                lender: this.loggedInUser,
                borrower: '',
                borrowTime: '',
                requestNext: '',
                returnTime: '',
                requestNextExpiry: ''
            });

            title.value = '';
            author.value = '';
        }

        deleteBook(event) {
            const id = event.target.dataset.id;
            this.data = this.data.filter((o) => {
                return o.id != id;
            });
        }

        borrowBook(event) {
            const id = event.target.dataset.id;

            let timeInSeconds = prompt('Please enter borrow time', 30);
            if (timeInSeconds == null || timeInSeconds == undefined || timeInSeconds == "") {
                return;
            }

            for (const o of this.data) {
                if (o.id == id) {
                    o.borrower = this.loggedInUser;
                    o.borrowTime = new Date().getTime();
                    o.returnTime = new Date().setSeconds(new Date().getSeconds() + Number(timeInSeconds));
                    o.requestNext = '';
                    o.requestNextExpiry = '';
                    break;
                }
            }
        }

        returnBook(event) {
            const id = event.target.dataset.id;

            for (const o of this.data) {
                if (o.id == id) {
                    o.borrower = '';
                    o.borrowTime = '';
                    o.returnTime = '';
                    if(o.requestNext != ''){
                        o.requestNextExpiry = new Date().setSeconds(new Date().getSeconds() + 10);
                    }

                    break;
                }
            }
        }

        requestNext(event) {
            const id = event.target.dataset.id;

            for (const o of this.data) {
                if (o.id == id) {
                    o.requestNext = this.loggedInUser;
                    break;
                }
            }
        }


    }

    new Book();
})();