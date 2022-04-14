export default function parseHTML(htmlString: string) {
  const tmp = document.implementation.createHTMLDocument('');
  tmp.body.innerHTML = htmlString;
  return [tmp.body];
}
