export default function parseHTML(string) {
  let tmp = document.implementation.createHTMLDocument('');
  tmp.body.innerHTML = string;
  return [tmp.body];
}
