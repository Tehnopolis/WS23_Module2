/*
	Скрипт для добавления/удаления банковских карт
	на странице cards.html
*/

// Элементы
const cardsRow = document.querySelector('.bank__row');

const addCardModal = document.getElementById('addCardModal');
const addCardModalErr = document.getElementById('addCardModalErr');
const addCardForm = document.getElementById('addCardForm');

const cardNumberInput = document.querySelector('input[name="card"]');

// Функция создания карточки банковской карты
const createCard = (cardNumber) => {
	const isActive = true;

	// Определяем тип карты
	let type = null;
	if(!(/\d{16}/.test(cardNumber))) {
		addCardModalErr.innerText = 'Некорректный номер карты: должно быть число из 16 символов';
		return null;
	}
	else if(cardNumber.startsWith('1111')) type = 'Visa';
	else if(cardNumber.startsWith('2222')) type = 'MasterCard';
	else if(cardNumber.startsWith('3333')) type = 'Мир';
	else {
		addCardModalErr.innerText = 'Некорректный номер карты (первые 4 числа должны быть - 1111/2222/3333)';
		return null;
	}

	const cardEl = document.createElement('div');
	cardEl.setAttribute('class', 'bank__card card');
	cardEl.innerHTML = `
		<div class="card__body">
			<p class="card__muted">
				${type}
				<span class="card__text">${isActive ? 'Активна' : 'Закончился срок обслуживания карты'}</span>
			</p>
			<p class="card__title">•••• •••• •••• ${cardNumber.substr(cardNumber.length - 4)}</p>

			<button class="card__button button button__danger">Удалить</button>
		</div>
	`

	// Событие клика на кнопку удаления карты
	cardEl.querySelector('button')?.addEventListener('click', (e) => {
		e.preventDefault();

		// Удаляем карту
		cardEl.remove();
	});

	// Отдаем элемент карты
	return cardEl;
}

document.addEventListener('DOMContentLoaded', () => {
	// Добавляем обработчик при клике на кнопку "Добавить" в модальном окне
	addCardForm?.addEventListener('submit', (e) => {
		e.preventDefault();

		// Получаем номер карты
		const cardNumber = cardNumberInput?.value;

		// Создаем карту
		const cardEl = createCard(cardNumber);

		// Получили элемент
		if(cardEl instanceof HTMLElement) {
			cardsRow?.appendChild(cardEl);
	
			// Закрываем окно
			window.cards.hideModal();
		}
	});

	document.querySelectorAll('.modal__container').forEach(modalContainer => {
		modalContainer.addEventListener('click', (e) => {
			if(e.target === modalContainer) {
				modalContainer.classList.toggle('visible');
			}
		})
	});
});

window.cards = Object.freeze({
	openModal() {
		// Чистим значения
		cardNumberInput.value = '';
		addCardModalErr.innerText = '';

		addCardModal.classList.add('visible');
	},
	hideModal() {
		addCardModal.classList.remove('visible');
	}
});