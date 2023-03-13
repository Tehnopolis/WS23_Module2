/*
	Скрипт для бронирования машин
	на странице booking.html
*/

// Константы
const DISCOUNT_PER_3DAYS = 0.05;
const MAX_DISCOUNT = 0.25;

document.addEventListener('DOMContentLoaded', () => {
	// Элементы
	const bookingStartInput = document.querySelector('[name="booking_day"]');
	const bookingEndInput = document.querySelector('[name="return_day"]');
	const carEls = document.querySelectorAll('[data-car-id]');

	const errEl = document.getElementById('formErr');
	const priceEl = document.getElementById('booking_price');
	const priceFinalEl = document.getElementById('booking_price_final');

	function rewritePrices() {
		errEl.innerText = '';

		if(bookingStartInput.value.length <= 0 || bookingEndInput.value.length <= 0) {
			priceEl.innerText = '';
			priceFinalEl.innerText = '';
			errEl.innerText = 'Выберите сначала даты бронирования и возврата';
			return
		}

		// Высчитываем на сколько дней берется машина
		const startDate = new Date(bookingStartInput.value);
		const endDate = new Date(bookingEndInput.value);
		const rentInDays = (endDate - startDate) / (1000 * 3600 * 24);

		if(rentInDays !== NaN) {
			// Подсчитываем цену всех бронирований
			const calc = window.booking.calculatePrice(rentInDays)
			
			// Without discount
			if(calc.total === calc.totalWithDiscount) {
				priceEl.innerText = '';
				priceFinalEl.innerText = calc.totalWithDiscount + ' руб.';
			}
			// With discount
			else {
				priceEl.innerText = calc.total + ' руб.';
				priceFinalEl.innerText = calc.totalWithDiscount + ' руб.';
			}
		}
		else {
			priceEl.innerText = '';
			priceFinalEl.innerText = '';
		}
	}

	// Проходим по каждой картоке машины
	carEls.forEach(carEl => {
		const bookCarBtn = carEl.querySelector('button');

		const carId = carEl.getAttribute('data-car-id');
		const carPrice = parseInt(carEl.getAttribute('data-car-price') ?? 0);

		window.booking.addCar(carId, carPrice);

		// Бронирование машины 
		bookCarBtn.addEventListener('click', (e) => {
			e.preventDefault();

			// Забронирована -> отмена
			if(window.booking.bookings[carId].booked === true) {
				window.booking.unbook(carId);

				// Меняем вид кнопки
				bookCarBtn.classList.remove('button__danger');
				bookCarBtn.classList.add('button_primary');
				bookCarBtn.innerText = 'Бронировать';
			}
			// Не забронирована -> бронь
			else {
				window.booking.book(carId);

				// Меняем вид кнопки
				bookCarBtn.classList.remove('button_primary');
				bookCarBtn.classList.add('button__danger');
				bookCarBtn.innerText = 'Отменить бронь';
			}

			rewritePrices();
		});
	});

	// Делаем обновление цены при смене дат
	bookingStartInput.addEventListener('change', (e) => {
		rewritePrices();
	})
	bookingEndInput.addEventListener('change', (e) => {
		rewritePrices();
	})
});

window.booking = Object.freeze({
	bookings: {},

	addCar(id, price) {
		this.bookings[id] = {
			price,
			booked: false
		}
	},

	toggleBook(id) {
		this.bookings[id].booked = !this.bookings[id].booked;
	},
	book(id) {
		this.bookings[id].booked = true;
	},
	unbook(id) {
		this.bookings[id].booked = false;
	},

	calculatePrice(days) {
		let total = 0;
		let totalWithDiscount = 0;

		// Скидка 5% за каждые 3 дня
		let discount = (days / 3) * 0.05;
		// Максимальная скидка - 25%
		discount = Math.min(discount.toFixed(1), 0.25);

		// Подсчитаем цену и цену со скидкой
		for(let car of Object.values(this.bookings)) {
			// Машина забронирована?
			if(car.booked) {
				// Полная цена за все дни
				let totalPrice = car.price * days;

				total += totalPrice;
				totalWithDiscount += totalPrice - (totalPrice * discount);
			}
		}

		return { total, totalWithDiscount, discount };
	}
});