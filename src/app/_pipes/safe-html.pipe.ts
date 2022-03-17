import { TagContentType } from '@angular/compiler';
import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
  private userTag = /(@(?<name>([a-zA-Z]*\s*)*)#(?<id>\d+))/g;
  private categoryTag = /(#(?<name>([a-zA-Z]*\s*)*)\|(?<id>\d+)\|(?<catName>([a-zA-Z]*\s*)*)\|(?<catId>\d+))/g;

    constructor(private domSanitizer: DomSanitizer) { }
    transform(html) {
        return this.domSanitizer.bypassSecurityTrustHtml(this.stylize(html));
    }

  private stylize(text: string): string {
    text = this.escapeHtml(text);
    let stylizedText: string = '';
    if (text && text.length > 0) {
      for (let line of text.split("\n")) {
        var tags, details = [];
        while(tags = this.userTag.exec(line)){
          details.push({
            'match': tags[0],
            'name' : tags.groups.name,
            'id' : tags.groups.id
          });
          var tag = details.pop();
          line = line.replace(/(@(?<name>([a-zA-Z]*\s*)*)#(?<id>\d+))/,`<a onclick="event.stopPropagation()" href="/#/home/user/${tag.id}">@${tag.name}</a>`)
        }
        while(tags = this.categoryTag.exec(line)){
          details.push({
            'match': tags[0],
            'name' : tags.groups.name,
            'id' : tags.groups.id,
            'catName' : tags.groups.catName,
            'catId' : tags.groups.catId
          });
          var tag = details.pop();
          line = line.replace(/(#(?<name>([a-zA-Z]*\s*)*)\|(?<id>\d+)\|(?<catName>([a-zA-Z]*\s*)*)\|(?<catId>\d+))/,`<a onclick="event.stopPropagation()" href="/#/home/bulletinboard/filter/${tag.catId}">#${tag.name}|${tag.catName}</a>`)
        }
        for (let t of line.split(" ")) {
          if (t.startsWith("http") && t.length>7) {  //linkify url's
            stylizedText += `<a href="${t}">${t}</a> `;
          }
          else {
            stylizedText += t + " ";
          }
        }
        
        stylizedText += '<br>';
      }
      return stylizedText;
    }
    else return text;
  }

  private escapeHtml(unsafe) {
    return unsafe ? unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;").replace(/'/g, "&#039;") : null;
  }
}