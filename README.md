# Riches of Aztec's Cascading Reels Simulator

![Reels](img/reels.png)

## Overview

This is an Riches of Aztec's Cascading Reels Simulator designed to visualize game boards and cascade elimination effects.

## Features

- **Visual Board Rendering**: Display 32-cell hexagonal game board
- **Cascade Elimination Simulation**: Show continuous elimination and falling effects
- **Interactive Blinking Effects**: Click blinking cells to toggle visibility
- **Border Marking System**: Support for normal, silver, and gold borders
- **Game Data Parsing**: Parse and display complete game round data

## Usage

1. Open `index.html` in your browser
2. Paste JSON-formatted game data into the input field
3. The system will automatically render all board states
4. Click blinking cells to toggle show/hide effects

## File Structure

- `index.html` - Main HTML page
- `style.css` - Stylesheet
- `style.js` - JavaScript logic

## Technical Features

- **13 Symbol Colors**: SF, WW, H1-H6, A, K, Q, J, T
- **Position Mapping System**: Support conversion from 48-cell fake reel to 32-cell real reel
- **Border Overlay**: Dynamic border marking generation
- **Responsive Design**: Support for different screen sizes

## Development Notes

### Symbol Mapping
- 0: SF (Scatter)
- 1: WW (Wild)
- 2-7: H1-H6 (High symbols)
- 8-12: A K Q J T (Low symbols)

### Board Configuration
- 6 columns × 5 rows hexagonal layout
- Total of 32 valid cells
- Support for 2-cell, 3-cell, and 4-cell consecutive border marking

## License

This project is for learning and testing purposes only.
