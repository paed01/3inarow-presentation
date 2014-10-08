The game
========

The actual game logic.

- [Board](#board)
- [Who wins](#who-wins)
- [Determining the winner](#determining-the-winner)
- [Draw](#draw)

## Board

The board consist of 3 by 3 fields. Each field has an id:

|         | Col 1| Col 2 | Col 3 |
|--------:|-----:|------:|------:|
|**Row 1**|   `1`|    `2`|    `4`|
|**Row 2**|   `8`|   `16`|   `32`|
|**Row 3**|  `64`|  `128`|  `256`|

## Who wins

The first sign to reach 3 in a row wins.

## Determining the winner

The sum of the winning streaks are calculated by the sum of the ids:

|         | Col 1| Col 2 | Col 3 |   Sum |
|--------:|-----:|------:|------:|------:|
|**Row 1**|   `1`|    `2`|    `4`|    *7*|
|**Row 2**|   `8`|   `16`|   `32`|   *56*|
|**Row 3**|  `64`|  `128`|  `256`|  *448*|
|*84*     |  *73*|  *146*|  *292*|  *273*|

For exampel if X manages to get the top left diagonal streak, the sum of ids sums up to *273*.

|         | Col 1| Col 2 | Col 3 |   Sum |
|--------:|-----:|------:|------:|------:|
|**Row 1**|   `X`|    `O`|    `O`|       |
|**Row 2**|      |    `X`|       |       |
|**Row 3**|   `X`|    `O`|    `X`|       |
|**Sum**  |      |       |       |  *273*|

or expressed as code:

```javascript
var streaks = [7, 56, 73, 84, 146, 273, 292, 448];

// The participant signs (X, O) have there own sum of ids
var sumX = (1 + 16 + 64 + 256);

// The sum is bit-compared with the streak sums
if ((sumX & 273) === 273) {
    console.log('X wins with top left diagonal streak');
} else if ((sumX & 146) === 146) {
    console.log('X rules by filling column 2!');
)

```

Or more likely:

```javascript
var streaks = [7, 56, 73, 84, 146, 273, 292, 448];

// The participant signs (X, O) have there own sum of ids
var sumX = (1 + 16 + 64 + 256);
var sumO = (2 + 4 + 128);

// The sum is bit-compared with the streak sums
for (var i in streaks) {
    var streak = streaks[i];
    if ((sumX & streak) === streak) {
        console.log('X wins');
        break;
    } else if ((sumO & streak) === streak) {
        console.log('O rules!');
        break;
    ) else if (sumX + sumO === 511) {
        console.log('It\'s a draw!');
        break;
    }
}
```

## Draw

If for some reason no sign has a streak of three the game is a draw. A draw is calculated from the sum of all checked ids, i.e. *511*.

|         | Col 1| Col 2 | Col 3 |
|--------:|-----:|------:|------:|
|**Row 1**|   `X`|    `O`|    `O`|
|**Row 2**|   `O`|    `X`|    `X`|
|**Row 3**|   `X`|    `O`|    `O`|

[>> Next](/docs/Step3.md)