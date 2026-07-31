import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

@Pipe({
  name: 'videoEmbed',
  standalone: true
})
export class VideoEmbedPipe implements PipeTransform {
  private platformId = inject(PLATFORM_ID);

  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return content as SafeHtml;

    // Only process on browser side
    if (!isPlatformBrowser(this.platformId)) {
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    let html = content;

    // Replace video markers with iframes
    // [VIDEO:youtube:VIDEO_ID] -> YouTube iframe
    html = html.replace(
      /\[VIDEO:youtube:([a-zA-Z0-9_-]+)\]/g,
      '<iframe class="video-embed" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    );

    // [VIDEO:vimeo:VIDEO_ID] -> Vimeo iframe
    html = html.replace(
      /\[VIDEO:vimeo:(\d+)\]/g,
      '<iframe class="video-embed" src="https://player.vimeo.com/video/$1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>'
    );

    // [VIDEO:instagram:REEL_ID] -> Instagram iframe
    html = html.replace(
      /\[VIDEO:instagram:([a-zA-Z0-9_-]+)\]/g,
      '<iframe class="video-embed" src="https://www.instagram.com/reel/$1/embed/" frameborder="0"></iframe>'
    );

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
