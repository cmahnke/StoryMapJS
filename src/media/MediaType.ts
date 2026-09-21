import Image from "./types/Image";
import YouTube from "./types/YouTube";
import Blockquote from "./types/Blockquote";
import Wikipedia from "./types/Wikipedia";
import SoundCloud from "./types/SoundCloud";
import Vimeo from "./types/Vimeo";
import Video from "./types/Video";
import Audio from "./types/Audio";
import DailyMotion from "./types/DailyMotion";
import Twitter from "./types/Twitter";
import Flickr from "./types/Flickr";
import GoogleDoc from "./types/GoogleDoc";
import IFrame from "./types/IFrame";
import Website from "./types/Website";
import Facebook from "./types/Facebook";
import DocumentCloud from "./types/DocumentCloud";
import Juxtapose from "./types/Juxtapose";
import { Media } from "./Media";
import { MediaTypeMatch, StorymapSlideMedia } from "../types";

/*	MediaType
	Determines the type of media the url string is.
	returns an object with .type and .id
	You can add new media types by adding a regex
	to match and the media class name to use to
	render the media
================================================== */

/* A media type table entry: like MediaTypeMatch, but match_str may be
	a RegExp for pattern-based types (e.g. images). */
type MediaTypeEntry = Omit<MediaTypeMatch, "match_str"> & {
    match_str: string | RegExp;
};

/**
 * Resolve the media handler for a slide's media object: matches the URL (and
 * optional explicit `type`) against the supported media types — YouTube,
 * Vimeo, images, audio, video, ...
 *
 * @param m - The slide media definition.
 * @returns The matching media type entry, or `false` for unknown media.
 */
export default function MediaType(m: StorymapSlideMedia): MediaTypeMatch | false {
    const media_types: MediaTypeEntry[] = [
        {
            type: "youtube",
            name: "YouTube",
            match_str: "(www.)?youtube|youtu.be",
            cls: YouTube,
        },
        {
            type: "vimeo",
            name: "Vimeo",
            match_str: "(player.)?vimeo.com",
            cls: Vimeo,
        },
        {
            type: "dailymotion",
            name: "DailyMotion",
            match_str: "(www.)?dailymotion.com",
            cls: DailyMotion,
        },
        {
            type: "soundcloud",
            name: "SoundCloud",
            match_str: "(player.)?soundcloud.com",
            cls: SoundCloud,
        },
        {
            type: "twitter",
            name: "Twitter",
            match_str: "^(https?:)?/+(www.)?(twitter|x).com",
            cls: Twitter,
        },
        {
            type: "flickr",
            name: "Flickr",
            match_str: "flickr.com/photos",
            cls: Flickr,
        },
        {
            type: "image",
            name: "Image",
            match_str: /jpg|jpeg|png|gif|webp/i,
            cls: Image,
        },
        {
            type: "video",
            name: "Video",
            match_str: /(mp4|webm)(\?.*)?$/i,
            cls: Video,
        },
        {
            type: "audio",
            name: "Audio",
            match_str: /(mp3|wav|m4a)(\?.*)?$/i,
            cls: Audio,
        },
        {
            type: "googledocs",
            name: "Google Doc",
            match_str:
                "^(https?:)?/*[^.]*.google.com/[^/]*/d/[^/]*/[^/]*?usp=sharing|^(https?:)?/*drive.google.com/open?id=[^&]*&authuser=0|^(https?:)?//*drive.google.com/open\\?id=[^&]*|^(https?:)?/*[^.]*.googledrive.com/host/[^/]*/",
            cls: GoogleDoc,
        },
        {
            type: "wikipedia",
            name: "Wikipedia",
            match_str: "(www.)?wikipedia.org",
            cls: Wikipedia,
        },
        {
            type: "iframe",
            name: "iFrame",
            match_str: "iframe",
            cls: IFrame,
        },
        {
            type: "facebook",
            name: "Facebook",
            match_str: "(www.)?facebook.com",
            cls: Facebook,
        },
        {
            type: "documentcloud",
            name: "DocumentCloud",
            match_str: "documentcloud.org/documents/",
            cls: DocumentCloud,
        },
        {
            type: "juxtapose",
            name: "Juxtapose",
            match_str: "juxtapose",
            cls: Juxtapose,
        },
        {
            type: "blockquote",
            name: "Quote",
            match_str: "blockquote",
            cls: Blockquote,
        },
        {
            type: "website",
            name: "Website",
            match_str: "https?://",
            cls: Website,
        },
        {
            type: "",
            name: "",
            match_str: "",
            cls: Media,
        },
    ];

    for (const media_type of media_types) {
        if (typeof m.url === "string" && m.url.match(media_type.match_str)) {
            return media_type as MediaTypeMatch;
        }
    }

    return false;
}
