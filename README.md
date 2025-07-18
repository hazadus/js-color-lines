# Color Lines

Попытка реализовать классическую игру [Color Lines](https://ru.wikipedia.org/wiki/Color_Lines) на чистом HTML, CSS и JavaScript.

Одна из основных идей – использовать только CSS для оформления и эффектов, без изображений.

![Screenshot](./images/screenshot.png)

Актуальная версия игры доступна на https://hazadus.github.io/js-color-lines/

## Игровой процесс

Игра происходит на квадратном поле в 9×9 клеток и представляет собой серию ходов. На каждом ходу сначала компьютер в случайных клетках выставляет три шарика случайных цветов, последних всего шесть.

Далее делает ход игрок, он может передвинуть любой шарик в другую свободную клетку, но при этом между начальной и конечной клетками должен существовать недиагональный путь из свободных клеток. Если после перемещения получается так, что собирается пять или более шариков одного цвета в линию по горизонтали, вертикали или диагонали, то все такие шарики исчезают и игроку даётся возможность сделать ещё одно перемещение шарика. Если после перемещения линии не выстраивается, то ход заканчивается, и начинается новый с появлением новых шариков.

Если при появлении новых шариков собирается линия, то она исчезает, игрок получает очки, но дополнительного перемещения не даётся. Игра продолжается до тех пор, пока всё поле не будет заполнено шариками и игрок не потеряет возможность сделать ход.

Цель игры состоит в наборе максимального количества очков.

🚧 **В данной реализации подсчёт очков пока не ведётся!** 🚧

## Ссылки на использованные при разработке материалы

- Bounce animation
  - https://www.youtube.com/watch?v=drsUJIBKdXk
- Ball 3D effect
  - https://cssanimation.rocks/spheres/
  - https://dev.to/ryandsouza13/creating-a-fake-3d-effect-in-css-using-a-single-div-17a
- Ball moving (with pathfinding)
  - https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/
  - https://dev.to/codesphere/pathfinding-with-javascript-the-a-algorithm-3jlb
