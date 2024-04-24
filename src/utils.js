export function displayDialogue(text, onDisplayEnd) {
  const textboxContainer = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");

  textboxContainer.style.display = "block";
  let index = 0;
  let currentText = "";
  const displayText = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(displayText);
  }, 16);

  const closeBtn = document.getElementById("close");

  function onCloseBtnClick() {
    onDisplayEnd();
    textboxContainer.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(displayText);
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }

  closeBtn.addEventListener("click", onCloseBtnClick);

  addEventListener("keypress", (key) => {
    if (key.code === "Enter") {
      onCloseBtnClick();
    }
  });
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
  } else {
    k.camScale(k.vec2(1.45));
  }
}
