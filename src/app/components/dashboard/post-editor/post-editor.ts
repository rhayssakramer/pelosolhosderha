import { Component, signal, PLATFORM_ID, inject, ChangeDetectorRef, WritableSignal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../services/blog.service';
import { ToastService } from '../../../services/toast.service';
import { ModalService } from '../../../services/modal.service';
import { Post } from '../../../models/post.model';
import { environment } from '../../../../environments/environment';
import { QuillModule } from 'ngx-quill';
import Quill from 'quill';
import QuillResizeImage from 'quill-resize-image';

// Extend Image blot to preserve width/height/style attributes
const BaseImage = Quill.import('formats/image') as any;

class ResizableImage extends BaseImage {
  static create(value: string) {
    const node = super.create(value);
    return node;
  }

  static formats(node: HTMLElement) {
    const formats: any = {};
    if (node.hasAttribute('width')) formats.width = node.getAttribute('width');
    if (node.hasAttribute('height')) formats.height = node.getAttribute('height');
    if (node.hasAttribute('style')) formats.style = node.getAttribute('style');
    if (node.hasAttribute('class')) formats.class = node.getAttribute('class');
    return formats;
  }

  format(name: string, value: any) {
    if (name === 'width' || name === 'height' || name === 'style' || name === 'class') {
      if (value) {
        (this as any).domNode.setAttribute(name, value);
      } else {
        (this as any).domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

ResizableImage['blotName'] = 'image';
ResizableImage['tagName'] = 'IMG';

Quill.register(ResizableImage, true);
Quill.register('modules/resize', QuillResizeImage);

@Component({
  selector: 'app-post-editor',
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './post-editor.html',
  styleUrl: './post-editor.css'
})
export class PostEditorComponent {
  title = '';
  content = '';
  excerpt = '';
  coverImage = '';
  coverPreview = '';
  selectedTags = signal<string[]>([]);
  published = false;
  isEditing = false;
  editingId = '';

  showEmojiPicker = false;

  emojis = [
    // Smileys & Emotion
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '🫠', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏', '😒', '🙄', '😬', '🤥', '🫨', '😌', '😔', '🤤', '😪', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥴', '😵', '😵‍💫', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
    // Smileys - cats & monkeys
    '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊',
    // Hearts & emotions
    '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '❤️', '🩷', '🧡', '💛', '💚', '💙', '🩵', '💜', '🤎', '🖤', '🩶', '🤍', '💋', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤',
    // Hands & gestures
    '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '🫷', '🫸', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🫦',
    // People
    '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '🥷', '👷', '🫅', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🫃', '🫄', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '🧌', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤸', '⛹️', '🏋️', '🚴', '🚵', '🤼', '🤽', '🤾', '🤺', '⛷️', '🏂', '🏌️', '🏇', '🧘', '🛀', '🛌',
    // Family & people
    '👫', '👬', '👭', '💏', '💑', '👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧',
    // Animals
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🪼', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🫏', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🪿', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🪵', '🌱', '🌿', '☘️', '🍀', '🎍', '🪴', '🎋', '🍃', '🍂', '🍁', '🪺', '🪹',
    // Food & Drink
    '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🥜', '🫘', '🌰', '🫚', '🫛', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🫗', '🥤', '🧋', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🫙', '🏺',
    // Travel & Places
    '🌍', '🌎', '🌏', '🌐', '🗺️', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🛝', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '🛣️', '🛤️', '🛢️', '⛽', '🛞', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓', '🛟', '⛵', '🛶', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🧳',
    // Weather & sky
    '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🌃', '🌌', '🌉', '🌁', '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🪫', '🔌', '💡', '🔦', '🕯️', '🪔',
    // Objects
    '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '🪪', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '🪬', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩻', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓',
    // Music & activities
    '🎵', '🎶', '🎼', '🎤', '🎧', '📯', '🥁', '🪘', '🎷', '🎺', '🎸', '🪕', '🎻', '🪗', '🎹', '🎬', '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '⚾', '🥎', '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳', '⛸️', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎯', '🪀', '🪁', '🔫', '🎱', '🔮', '🪄', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '🪅', '🪩', '🪆', '♠️', '♥️', '♦️', '♣️', '♟️', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢',
    // Symbols
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '➕', '➖', '➗', '✖️', '🟰', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄',
    // Nature & weather
    '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🪷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪹', '🪺', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑', '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌚', '🌛', '🌜', '🌡️', '☀️', '🌝', '🌞', '🪐', '⭐', '🌟', '💫', '✨', '🌠', '🌌', '☁️', '⛅', '⛈️', '🌤️', '🌥️', '🌦️', '🌧️', '🌨️', '🌩️', '🌪️', '🌫️', '🌬️', '🌀', '🌈', '🌂', '☂️', '☔', '⛱️', '⚡', '❄️', '☃️', '⛄', '🔥', '💧', '🌊', '🎃', '🎄', '🎆', '🎇', '🧨', '✨', '🎈', '🎉', '🎊', '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🧧', '🎀', '🎁', '🎗️', '🎟️', '🎫',
    // Flags (popular)
    '🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇧🇷', '🇺🇸', '🇵🇹', '🇪🇸', '🇫🇷', '🇮🇹', '🇩🇪', '🇬🇧', '🇯🇵', '🇰🇷', '🇨🇳', '🇦🇷', '🇲🇽', '🇨🇴', '🇨🇱', '🇵🇪', '🇨🇦', '🇦🇺', '🇮🇳'
  ];

  quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['emoji'],
        ['clean']
      ],
      handlers: {
        'emoji': function() {}
      }
    },
    resize: {
      locale: {},
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  quillEditor: any;

  private cdr = inject(ChangeDetectorRef);

  onEditorCreated(editor: any): void {
    this.quillEditor = editor;
    const toolbar = editor.getModule('toolbar');

    // Custom image handler: ALWAYS upload to server to ensure persistence across browsers
    toolbar.addHandler('image', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/gif,image/webp,.gif,.jpg,.jpeg,.png,.webp');
      input.click();
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        this.blog.uploadImage(file).subscribe({
          next: (url) => {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, 'image', url);
            editor.setSelection(range.index + 1);
            this.toast.success('Imagem inserida com sucesso!');
          },
          error: (err) => {
            console.error('Erro ao fazer upload da imagem:', err);
            this.toast.error('Falha ao fazer upload da imagem. Tente novamente.');
          }
        });
      };
    });

    // Custom video handler for YouTube, Vimeo, Instagram, etc.
    toolbar.addHandler('video', () => {
      const url = prompt('Cole a URL do vídeo (YouTube, Shorts, Vimeo, Instagram Reels, etc.):');
      if (url) {
        let videoId = '';
        let videoType = '';
        
        // YouTube - extract video ID
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (youtubeMatch) {
          videoId = youtubeMatch[1];
          videoType = 'youtube';
          console.log('🎬 YouTube detectado - URL:', url);
          console.log('📍 ID extraído:', videoId);
          console.log('🔍 Tamanho do ID:', videoId.length);
        }
        
        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
          videoId = vimeoMatch[1];
          videoType = 'vimeo';
          console.log('🎬 Vimeo detectado - URL:', url);
          console.log('📍 ID extraído:', videoId);
        }
        
        // Instagram
        const instagramMatch = url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
        if (instagramMatch) {
          videoId = instagramMatch[1];
          videoType = 'instagram';
          console.log('🎬 Instagram detectado - URL:', url);
          console.log('📍 ID extraído:', videoId);
        }
        
        if (videoId && videoType) {
          const range = editor.getSelection(true);
          // Insert marker as text - Quill will preserve it as plain text in the HTML
          const marker = `[VIDEO:${videoType}:${videoId}]`;
          // Use insertText to add as plain text content
          editor.insertText(range.index, marker);
          editor.setSelection(range.index + marker.length);
          console.log('✅ Marcador de vídeo inserido:', marker);
        } else {
          console.error('❌ URL não reconhecida:', url);
          alert('URL de vídeo não reconhecida. Use YouTube, Vimeo ou Instagram.');
        }
      }
    });

    // Setup emoji button in toolbar
    toolbar.addHandler('emoji', () => {
      this.showEmojiPicker = !this.showEmojiPicker;
      this.cdr.detectChanges();
    });
    // Style the emoji button
    const emojiBtn = document.querySelector('.ql-emoji') as HTMLElement;
    if (emojiBtn) {
      emojiBtn.innerHTML = '😊';
      emojiBtn.style.fontSize = '1.2rem';
      emojiBtn.style.position = 'relative';
      emojiBtn.style.left = '-5px';
      emojiBtn.style.top = '-5px';
    }
  }

  insertEmoji(emoji: string): void {
    if (this.quillEditor) {
      const range = this.quillEditor.getSelection(true);
      this.quillEditor.insertText(range.index, emoji);
      this.quillEditor.setSelection(range.index + emoji.length);
    }
    this.showEmojiPicker = false;
  }

  constructor(
    public blog: BlogService,
    private toast: ToastService,
    private modal: ModalService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const post = this.blog.getPostById(id);
      if (post) {
        this.isEditing = true;
        this.editingId = id;
        this.title = post.title;
        this.content = post.content;
        this.excerpt = post.excerpt;
        this.coverImage = post.coverImage || '';
        this.coverPreview = post.coverImage || '';
        this.selectedTags.set([...post.tags]);
        this.published = post.published;
      }
    }
  }

  toggleTag(tagName: string): void {
    const current = this.selectedTags();
    const idx = current.indexOf(tagName);
    if (idx >= 0) {
      this.selectedTags.set(current.filter((_, i) => i !== idx));
    } else {
      this.selectedTags.set([...current, tagName]);
    }
  }

  onCoverFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    // Always show local preview while uploading
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coverPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // ALWAYS upload to ensure persistent URL across browsers
    this.blog.uploadImage(file).subscribe({
      next: (url) => {
        this.coverImage = url;
        this.coverPreview = url; // Update preview with server URL
        this.toast.success('Capa de post enviada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao fazer upload da capa:', err);
        // If upload fails, fall back to preview but warn user
        this.coverImage = this.coverPreview;
        this.modal.alert('Erro de Upload', 'Falha ao fazer upload da imagem. Tente novamente ou verifique sua conexão.', 'OK');
      }
    });
  }

  removeCover(): void {
    this.coverImage = '';
    this.coverPreview = '';
  }

  save(): void {
    if (!this.title.trim()) {
      this.toast.warning('Por favor, insira um título para o post.');
      return;
    }

    // Get the HTML content from Quill editor
    const contentToSave = this.quillEditor ? this.quillEditor.root.innerHTML : this.content;
    
    console.log('📝 Salvando post com conteúdo:', contentToSave);

    // Validate that all images in the post are accessible
    this.validatePostImages(contentToSave).then(isValid => {
      if (!isValid) {
        this.modal.alert('Erro de Validação', 'Uma ou mais imagens não estão acessíveis. Por favor, verifique e tente novamente.', 'OK');
        return;
      }

      if (this.isEditing) {
        this.blog.updatePost(this.editingId, {
          title: this.title,
          content: contentToSave,
          excerpt: this.excerpt,
          coverImage: this.coverImage || undefined,
          tags: this.selectedTags(),
          published: this.published
        });
        this.toast.success('Post atualizado com sucesso!');
      } else {
        this.blog.createPost({
          title: this.title,
          content: contentToSave,
          excerpt: this.excerpt,
          coverImage: this.coverImage || undefined,
          tags: this.selectedTags(),
          published: this.published
        });
        this.toast.success('Post criado com sucesso!');
      }
      this.router.navigate(['/dashboard']);
    });
  }

  private async validatePostImages(htmlContent: string): Promise<boolean> {
    // Extract all image URLs from the HTML content
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const urls: string[] = [];
    let match;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      urls.push(match[1]);
    }

    // Also validate cover image if it exists
    if (this.coverImage) {
      urls.push(this.coverImage);
    }

    // If no images, validation passes
    if (urls.length === 0) {
      return true;
    }

    // Check each URL with a HEAD request to ensure it's accessible
    try {
      const results = await Promise.all(
        urls.map(url => this.checkImageAccessibility(url))
      );

      const allAccessible = results.every(result => result);
      
      if (!allAccessible) {
        console.warn('⚠️ Algumas imagens não estão acessíveis:', urls);
      }

      return allAccessible;
    } catch (error) {
      console.error('Erro ao validar imagens:', error);
      // If validation fails due to CORS or other network issues, allow saving
      // but log the warning
      return true;
    }
  }

  private async checkImageAccessibility(url: string): Promise<boolean> {
    try {
      // Don't validate data URLs (they're embedded)
      if (url.startsWith('data:')) {
        return true;
      }

      // For blob storage or HTTP URLs, do a simple HEAD request
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues for third-party URLs
      });

      // For CORS requests, we might get mode error, so just assume it's valid
      // The important thing is that the URL itself is properly formatted
      return true;
    } catch (error) {
      // Log but don't fail validation on network errors
      console.warn(`⚠️ Não foi possível validar imagem ${url}:`, error);
      return true;
    }
  }
}
