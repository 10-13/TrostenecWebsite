/**
 * Функция для переключения видимости контента аккордеона.
 */
function toggleAccordion(header) {
  const accordion = header.parentElement;
  accordion.classList.toggle('active');
}

/**
 * Преобразует кастомные теги <accordion> в рабочую HTML-структуру.
 */
function transformAccordions() {
  const accordions = document.querySelectorAll('accordion');
  accordions.forEach(acc => {
    const title = acc.getAttribute('title');
    const act = acc.hasAttribute('active')
    const contentHTML = acc.innerHTML;
    const wrapper = document.createElement('div');
    wrapper.className = act ? 'accordion active' : 'accordion';
    wrapper.innerHTML = `
      <div class="accordion-header" onclick="toggleAccordion(this)">${title}</div>
      <div class="underline"></div>
      <div class="accordion-content">${contentHTML}</div>
    `;
    acc.parentNode.replaceChild(wrapper, acc);
  });
}

function transformGalleries() {
  const galleries = document.querySelectorAll('image-gallery');

  galleries.forEach(gallery => {
    const prefix = gallery.getAttribute('prefix') || '';
    const suffix = gallery.getAttribute('suffix') || '';
    const rangeString = gallery.textContent.trim();
    
    let imagesHTML = '';
    const numbers = [];

    // Парсим строку с диапазонами и числами (например, "1-10, 12-15")
    const parts = rangeString.split(',').map(part => part.trim());
    
    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(num => parseInt(num, 10));
        for (let i = start; i <= end; i++) {
          numbers.push(i);
        }
      } else if (part) {
        numbers.push(parseInt(part, 10));
      }
    });

    // Генерируем HTML-строки для каждого изображения
    numbers.forEach(num => {
      imagesHTML += `<img src="${prefix}${num}${suffix}" alt="Image ${num}" />\n`;
    });

    // Создаем div-обертку
    const wrapperDiv = document.createElement('div');
    // *** ВОТ ЭТА СТРОКА ДОБАВЛЕНА ***
    wrapperDiv.className = 'gallery-grid'; // Присваиваем класс для стилизации
    wrapperDiv.innerHTML = imagesHTML;
    
    // Заменяем <image-gallery> на нашу новую обертку с картинками
    gallery.parentNode.replaceChild(wrapperDiv, gallery);
  });
}

/**
 * НОВАЯ ФУНКЦИЯ
 * Создает и возвращает HTML-код шапки в виде строки.
 * @param {string} title - Заголовок, который нужно отобразить на странице.
 * @returns {string} - Готовая HTML-строка для шапки.
 */
function createHeaderHTML(title) {
  // Используем шаблонные строки (обратные кавычки ``) для удобного создания HTML
  return `
    <div class="menu-container">
      <button class="menu-button" id="menuBtn">Меню</button>
      <div class="dropdown-menu" id="dropdownMenu">
        <a href="index.html">Главная</a>
        <a href="about.html">О проекте</a>
        <a href="content-1.html">Краеведческая работа</a>
        <a href="content-2.html">Методические разработки</a>
        <a href="content-3.html">Фотоотчёт</a>
        <a href="content-4.html">Экскурсии</a>
      </div>
    </div>
    <a class="logo-button">${title}</a>
  `;
}

/**
 * НОВАЯ ФУНКЦИЯ
 * Инициализирует оверлей для изображений: создает его HTML и добавляет логику.
 */
function initializeImageOverlay() {
  // 1. Создаем HTML оверлея и добавляем его в конец body
  const overlayHTML = `
    <div id="image-overlay">
      <span id="close-overlay">&times;</span>
      <img id="overlay-image" src="" alt="Full size image" />
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', overlayHTML);

  // 2. Находим созданные элементы
  const overlay = document.getElementById('image-overlay');
  const overlayImage = document.getElementById('overlay-image');
  const closeBtn = document.getElementById('close-overlay');

  // 3. Функция для закрытия оверлея
  const closeOverlay = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Возвращаем прокрутку страницы
  };

  // 4. Логика открытия: используем делегирование событий для эффективности
  document.body.addEventListener('click', (event) => {
    // Проверяем, был ли клик по картинке внутри .gallery-grid
    if (event.target.matches('.gallery-grid img')) {
      const clickedImageSrc = event.target.src;
      overlayImage.src = clickedImageSrc; // Устанавливаем src для большой картинки
      overlay.classList.add('active'); // Показываем оверлей
      document.body.style.overflow = 'hidden'; // Убираем прокрутку страницы
    }
  });

  // 5. Назначаем события для закрытия
  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (event) => {
    // Закрываем, только если клик был по фону, а не по самой картинке
    if (event.target === overlay) {
      closeOverlay();
    }
  });
  
  // Закрытие по клавише Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('active')) {
      closeOverlay();
    }
  });
}


/**
 * Основной блок, который выполняется после загрузки страницы.
 */
document.addEventListener("DOMContentLoaded", function() {

  transformGalleries();
  transformAccordions();

  // 2. Конструируем и вставляем шапку
  const headerPlaceholder = document.querySelector('#header-placeholder');
  if (headerPlaceholder) {
    // Получаем заголовок для текущей страницы из data-атрибута
    const pageTitle = document.body.dataset.pageTitle || 'Заголовок по умолчанию';

    // 2.1. Генерируем HTML для шапки с помощью нашей новой функции
    const headerHTML = createHeaderHTML(pageTitle);

    // 2.2. Вставляем сгенерированный HTML на страницу
    headerPlaceholder.innerHTML = headerHTML;

    // 2.3. "Оживляем" меню, добавляя обработчики событий к новым элементам
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (menuBtn && dropdownMenu) {
      menuBtn.addEventListener('click', () => {
        dropdownMenu.classList.toggle('active');
      });

      // Закрываем меню при клике вне его области
      document.addEventListener('click', (event) => {
        if (!menuBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
          dropdownMenu.classList.remove('active');
        }
      });
    }
  }
  initializeImageOverlay();
});