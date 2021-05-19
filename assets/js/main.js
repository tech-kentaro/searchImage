const apiKey = 'f49dcbbb0eb6a0a0649a49236b96ec5c';

const IS_INITIALIZED = 'IS_INITIALIZED';
const IS_FETCHING = 'IS_FETCHING';
const IS_FAILED = 'IS_FAILED';
const IS_FOUND = 'IS_FOUND';
const IS_NOTFOUND = 'IS_NOTFOUND';

const getRequestURL = (searchText) => {
  const parameters = $.param({
    method: 'flickr.photos.search',
    api_key: apiKey,
    text: searchText,
    sort: 'interestingness-desc',
    per_page: 100,
    license: '4',
    extras: 'owner_name, license',
    format: 'json',
    nojsoncallback: 1,
  });
  const url = `https://api.flickr.com/services/rest/?${parameters}`;
  return url;
};

const getFlickrImageURL = (photo, size) => {
  let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}`;
  if (size) {
    url += `_${size}`;
  }
  url += '.jpg';
  return url;
}

const getFlickrPageURL = photo => `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;

const getFlickrText = (photo) => {
  let text = `"${photo.title}" by ${photo.ownername}`;
  if (photo.license === '4') {
    text += ' / CC BY';
  }
  return text;
}

const app = Vue.createApp({
  data: function() {
    return {
      photos: [],
      prevSearchText: '',
      currentState: IS_INITIALIZED,
      isActive: false,
    }
  },
  computed: {
    isInitialized: function() {
      return this.currentState = IS_INITIALIZED;
    },
    isFetching: function() {
      return this.currentState = IS_FETCHING;
    },
    isFailed: function() {
      return this.currentState = IS_FAILED;
    },
    isFound: function() {
      return this.currentState = IS_FOUND;
    },
    isNotFound: function() {
      return this.currentState = IS_NOTFOUND;
    },
  },
  methods: {
    toInitialized: function() {
      this.currentState = IS_INITIALIZED;
    },
    toFetching: function() {
      this.currentState = IS_FETCHING;
    },
    toFailed: function() {
      this.currentState = IS_FAILED;
    },
    toFound: function() {
      this.currentState = IS_FOUND;
    },
    toNotFound: function() {
      this.currentState = IS_NOTFOUND;
    },
    fetchImagesFromFlickr: function(event) {
      const searchText = event.target.elements.search.value;

      if (this.isFetching && searchText === this.prevSearchText) {
        return;
      }

      this.prevSearchText = searchText;

      this.toFetching();

      const url = getRequestURL(searchText);
      $.getJSON(url, (data) => {
        if (data.stat !== 'ok') {
          this.toFailed();
          return;
        }

        const fetchedPhotos = data.photos.photo;

        if (fetchedPhotos.length === 0) {
          this.toNotFound();
          return;
        }

        this.photos = fetchedPhotos.map(photo => ({
          id: photo.id,
          imageURL: getFlickrImageURL(photo, 'q'),
          pageURL: getFlickrPageURL(photo),
          text: getFlickrText(photo),
        }));
        this.toFound();
      }).fail(() => {
        this.toFailed();
      });
    },
    onClickToggle: function(event) {
      if (this.isActive) {
        this.isActive = false
      } else {
        this.isActive = true
      }
      this.toInitialized();
    },
    onClickClose: function() {
      if (!this.isActive) {
        this.isActive = true
      } else {
        this.isActive = false
      }
    },
    onClickPageTop: function() {
      $('body, html').animate({
        scrollTop: 0
      }, 500);
      return false;
    },
  },
});

app.directive("tooltip", {
  mounted(el, binding) {
    init(el, binding);
  },
  updated(el, binding) {
    init(el, binding);
  }
});

function init(el, binding) {
  let position = binding.arg || "bottom";
  let tooltipText = binding.value || "Tooltip text";
  el.setAttribute("position", position);
  el.setAttribute("tooltip", tooltipText);
}

app.mount('#app');