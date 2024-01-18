// export default function decorate(block) {
//   const list = block.children;
//   [...list].forEach((item) => {
//     item.classList.add('item');
//   });
// }

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`image-list-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('image-list-img-col');
        }
      } else {
        col.classList.add('image-list-text-col');
      }
    });
  });
}
