//buffer element for countLines function
const buffer = document.createElement('textarea');
buffer.style.border = 'none';
buffer.style.height = '0';
buffer.style.overflow = 'hidden';
buffer.style.padding = '0';
buffer.style.position = 'absolute';
buffer.style.left = '0';
buffer.style.top = '0';
buffer.style.zIndex = '-1';
document.body.appendChild(buffer);

//get # of lines in a textarea html element
function countLines(textarea) {
  const cs = window.getComputedStyle(textarea);
  const pl = parseInt(cs.paddingLeft);
  const pr = parseInt(cs.paddingRight);
  let lh = parseInt(cs.lineHeight);

  // [cs.lineHeight] may return 'normal', which means line height = font size.
  if (isNaN(lh)) lh = parseInt(cs.fontSize);

  // Copy content width.
  buffer.style.width = (textarea.clientWidth - pl - pr) + 'px';

  // Copy text properties.
  buffer.style.font = cs.font;
  buffer.style.letterSpacing = cs.letterSpacing;
  buffer.style.whiteSpace = cs.whiteSpace;
  buffer.style.wordBreak = cs.wordBreak;
  buffer.style.wordSpacing = cs.wordSpacing;
  buffer.style.fontSize = cs.fontSize;
  buffer.style.fontFamilty = cs.fontFamily;

  // Copy value.
  buffer.value = textarea.value;

  let result = Math.floor(buffer.scrollHeight / lh);
  if (result == 0) result = 1;
  return result;
}
