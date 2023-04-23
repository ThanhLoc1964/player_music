/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random 
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYER-MUSIC'

const playlist = $(".playlist");
const player = $('.player')
const cd = $('.cd');
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const volume = $('#volume');




const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Tabun たぶん',
            singer: 'Yoasobi',
            path: './assets/music/1_Tabun-YOASOBI.mp3',
            image: './assets/img/1_Tabun.jpg'
        },
        {
            name: 'Yoru Ni Kakeru 夜に駆ける',
            singer: 'Yoasobi',
            path: './assets/music/2_Yoru ni Kakeru夜に駆ける_YOASOBI.mp3',
            image: './assets/img/2_Yoru\ Ni\ Kakeru.jpg'
        },
        {
            name: 'Ano yume wo nazotte あの夢をなぞって',
            singer: 'Yoasobi',
            path: './assets/music/3_Ano yume o nazotteあの夢をなぞって_YOASOBI.mp3',
            image: './assets/img/3_Ano\ yume\ wo\ nazotte.jpg'
        },
        {
            name: 'Gunjou 群青',
            singer: 'Yoasobi',
            path: './assets/music/4_Gunjou_YOASOBI群青.mp3',
            image: './assets/img/4_Gunjou.jpg'
        },
        {
            name: 'Harujion ハルジオン',
            singer: 'Yoasobi',
            path: './assets/music/5_Harujionハルジオン_YOASOBI.mp3',
            image: './assets/img/5_Harujion.jpg'
        },
        {
            name: 'Encore アンコール',
            singer: 'Yoasobi',
            path: './assets/music/6_Encoreアンコール_YOASOBI.mp3',
            image: './assets/img/6_Encore.jpg'
        },
        {
            name: 'Haruka ハルカ',
            singer: 'Yoasobi',
            path: './assets/music/7_Harukaハルカ_Yoasobi.mp3',
            image: './assets/img/7_Haruka.jpg'
        },
        {
            name: 'Yasashii Suisei 優しい彗星',
            singer: 'Yoasobi',
            path: './assets/music/8_Yasashii Suisei優しい彗星_YOASOBI.mp3',
            image: './assets/img/8_Yasashii\ Suisei.jpg'
        },
        {
            name: 'Kaibutsu  Suisei 怪物 ',
            singer: 'Yoasobi',
            path: './assets/music/9_Kaibutsu怪物_YOASOBI.mp3',
            image: './assets/img/9_Kaibutsu\ .jpg'
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = '${index}'>
                    <div class="thumb" style="background: url('${song.image}');">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join("");

    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;


        // Handle CD spins / stops 
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 20000,  // 20 seconds
            iterations: Infinity
        })

        cdThumbAnimate.pause();


        // Handles CD enlargement / reduction
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop;


            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }


        // Handle when click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // When the song is played
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing')
            cdThumbAnimate.play();
        }

        // When the song is pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // When the song progress changes
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
            }
        }

        // Handling when seek
        progress.onchange = function (e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
        }


        // When next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // When prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }


        //Handle on / off random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Handle next when audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        //Handle on // off repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }


        //Listening handle onclick on playlist
        playlist.onclick = function (e) {
            //Handle when click on song
            const songNode = e.target.closest('.song:not(.active)');
            if (e.target.closest('.song:not(.active)') || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
            }
        }


        volume.onchange = function () {
            audio.volume = Number(volume.value / 100);
        }

    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }

        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex == this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();

    },

    start: function () {
        // Assign configuration from config to application
        this.loadConfig();

        // Defines properties for the object
        this.defineProperties();

        // Listening / handling events (DOM events)
        this.handleEvents();

        // Load the first song information into the UI when running the app
        this.loadCurrentSong();


        // Render playlist
        this.render();

        // Display the initial state of the repeat & random button
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
        audio.volume = 1;
    }

}

app.start();

