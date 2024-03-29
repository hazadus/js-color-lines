# Color Lines

Classic Color Lines game written in pure HTML, CSS and JS.

The main idea was to use CSS effects as much as possible.

Currently does not detect diagonal lines.

![Screenshot](./images/screenshot.png)

## TODOs:

### Logic

- Detect diagonal lines of same color
  - https://en.wikipedia.org/wiki/Hough_transform
- Track game score
- Save highscore

### UI

- Add timer
- Full width (with padding) on mobile screen
- Score field
- Highscore field
- Next colors (?)

### System

- Save game state in local storage, restore on page reload.

## References

- Bounce animation
  - https://www.youtube.com/watch?v=drsUJIBKdXk
- Ball 3D effect
  - https://cssanimation.rocks/spheres/
  - https://dev.to/ryandsouza13/creating-a-fake-3d-effect-in-css-using-a-single-div-17a
- Ball moving (with pathfinding)
  - https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/
  - https://dev.to/codesphere/pathfinding-with-javascript-the-a-algorithm-3jlb
