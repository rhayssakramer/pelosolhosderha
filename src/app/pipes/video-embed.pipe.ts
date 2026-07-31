import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'videoEmbed',
  standalone: true
})
export class VideoEmbedPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return content as SafeHtml;

    let html = content;

    // YouTube URLs - only if not already in a link tag
    html = html.replace(
      /(?<!<a[^>]*href=")https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?!")/g,
      (match, videoId) => `<iframe class="video-embed" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    );

    // YouTube Shorts URLs
    html = html.replace(
      /(?<!<a[^>]*href=")https:\/\/www\.youtube\.com\/shorts\/([a-zA-Z0-9_-]+)(?!")/g,
      (match, videoId) => `<iframe class="video-embed" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    );

    // youtu.be URLs
    html = html.replace(
      /(?<!<a[^>]*href=")https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)(?!")/g,
      (match, videoId) => `<iframe class="video-embed" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    );

    // Vimeo URLs
    html = html.replace(
      /(?<!<a[^>]*href=")https:\/\/vimeo\.com\/(\d+)(?!")/g,
      (match, videoId) => `<iframe class="video-embed" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
    );

    // Instagram URLs
    html = html.replace(
      /(?<!<a[^>]*href=")https:\/\/www\.instagram\.com\/reel\/([a-zA-Z0-9_-]+)\/(?!")/g,
      (match, reelId) => `<iframe class="video-embed" src="https://www.instagram.com/reel/${reelId}/embed/" frameborder="0"></iframe>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
