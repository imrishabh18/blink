import React, { Component } from "react";
import { AppConfig, UserSession } from "blockstack";
import shortUUID from "short-uuid";
import axios from "axios";

import bookmarksHelper from "./bookmarkHelpers";
import __mock__bookmarksHelper from "../../../__mocks__/bookmarkHelpers";
import Masthead from "../../04-Ecosystems/Masthead";
import Footer from "../../03-Organisms/Footer";
import BookmarksList from "../../04-Ecosystems/BookmarksList";
import BookmarkForm from "../../03-Organisms/BookmarkForm";

import "../../../assets/styles/index.scss";
import { ReactComponent as Logo } from "../../../assets/images/agenda.svg";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

let bookmarkApi;

if (process.env.REACT_APP_OFFLINE) {
  console.log("*** using offline mode ***");
  bookmarkApi = __mock__bookmarksHelper();
} else {
  bookmarkApi = bookmarksHelper(userSession);
}

export default class App extends Component {
  constructor(props) {
    super(props);

    const isUserSignedIn = this.isUserSignedIn();

    this.state.isUserSignedIn = isUserSignedIn;
  }

  state = {
    isUserSignedIn: !!process.env.REACT_APP_OFFLINE,
    bookmarkIds: [],
    bookmarks: [],
    isLoaded: false,
    isShowingAddbookmark: false,
    errorMsg: null
  };

  async componentDidMount() {
    if (!this.isUserSignedIn()) {
      return false;
    }

    // get bookmarks.json
    try {
      const { bookmarkIds, bookmarks } = bookmarkApi.getBookmarks();

      if (process.env.REACT_APP_OFFLINE && process.env.REACT_APP_BUILD_CACHE) {
        localStorage.setItem(
          "blink/bookmarkIds.json",
          JSON.stringify(bookmarkIds)
        );

        bookmarks.forEach(bookmark => {
          localStorage.setItem(
            `blink/bookmarks/${bookmark.id}.json`,
            JSON.stringify(bookmark)
          );
        });
      }

      this.setState({
        bookmarkIds,
        bookmarks,
        isLoaded: true
      });
    } catch (e) {
      switch (e.message) {
        case "No bookmarks":
          this.setState({
            isLoaded: true
          });
          break;

        default:
          console.trace(e);
          this.setState({
            errorMsg: "Error parsing bookmarks from Blockstack"
          });
      }
    }
  }

  isUserSignedIn() {
    if (userSession.isUserSignedIn() || process.env.REACT_APP_OFFLINE) {
      return true;
    }
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(function() {
        window.location = window.location.origin;
      });
      return false;
    }
  }

  async addBookmark(bookmarkData) {
    const id = shortUUID.generate();

    const {
      author,
      content,
      date_published,
      dek,
      direction,
      domain,
      excerpt,
      lead_image_url: thumbnail,
      title,
      url,
      word_count: wordCount
    } = bookmarkData;

    const bookmark = {
      url,
      excerpt,
      title,
      thumbnail,
      wordCount,
      domain,
      id
    };

    const article = {
      author,
      content,
      date_published,
      dek,
      direction,
      id
    };

    const bookmarkIds = [id, ...this.state.bookmarkIds];
    const bookmarks = [bookmark, ...this.state.bookmarks];

    await bookmarkApi.saveBookmarkIds(bookmarkIds);
    await bookmarkApi.saveBookmark(bookmark);
    await bookmarkApi.saveArticle(article);

    this.setState({ bookmarkIds, bookmarks });
  }

  async deleteBookmark(id) {
    const bookmarkIds = this.state.bookmarkIds.filter(
      currentId => currentId !== id
    );

    const bookmarks = this.state.bookmarks.filter(
      ({ id: currentId }) => currentId !== id
    );

    await bookmarkApi.saveBookmarkIds(bookmarkIds);
    await userSession.deleteFile(`blink/bookmarks/${id}.json`);
    await userSession.deleteFile(`blink/articles/${id}.json`);

    console.log("deleted bookmarkIndex:", id);
    console.log("remaining bookmarks:", bookmarks);

    this.setState({ bookmarkIds, bookmarks });
  }

  handleSignIn() {
    userSession.redirectToSignIn();
  }

  handleSignOut() {
    userSession.signUserOut(window.location.origin);
  }

  handleAddBookmark = async formData => {
    const url = formData.get("url").replace(" ", "");
    let res;

    console.log("url:", url);

    if (url === "") {
      console.log("url is empty");
      return;
    }

    try {
      this.setState({ errorMsg: null });
      const res = await axios.post("/extract", {
        url
      });
      const bookmark = res.data;

      await this.addBookmark(bookmark);
      console.log("bookmark added:", bookmark);
    } catch (e) {
      console.trace("addBookmarkError:", e);
      this.setState({ errorMsg: "Unknown error" });
    }
  };

  handleDeleteBookmark = async id => {
    const deletedBookmark = this.state.bookmarks.find(
      ({ id: currentId }) => currentId === id
    );
    await this.deleteBookmark(id);
    console.log("bookmark deleted:", deletedBookmark);
  };

  handleShowAddBookmark = () => {
    this.setState({ isShowingAddbookmark: true });
  };

  handleHideAddBookmark = () => {
    this.setState({ isShowingAddbookmark: false });
  };

  renderBookmarkList() {
    const { bookmarks, isLoaded, isShowingAddbookmark, errorMsg } = this.state;

    if (!isLoaded) {
      return "loading...";
    }

    const bookmarksList =
      bookmarks && Array.isArray(bookmarks) && bookmarks.length > 0 ? (
        <BookmarksList
          bookmarks={bookmarks}
          onDeleteBookmark={this.handleDeleteBookmark}
        />
      ) : (
        "no bookmarks"
      );

    return (
      <>
        {errorMsg && errorMsg}
        <main className="main">
          <h1>All bookmarks</h1>
          {isShowingAddbookmark && (
            <BookmarkForm
              onSubmit={this.handleAddBookmark}
              handleHideAddBookmarks={this.handleHideAddBookmark}
            />
          )}
          {bookmarksList}
        </main>
      </>
    );
  }

  render() {
    const isUserSignedIn = this.isUserSignedIn();

    if (!isUserSignedIn) {
      return (
        <>
          <div className="container full">
            <div className="logo-container">
              <Logo className="logo" />
              <h1 className="logo-title">Blink</h1>
              <button className="button" onClick={this.handleSignIn}>
                Sign in with Bockstack
              </button>
            </div>
            <Footer isUserSignedIn={isUserSignedIn} />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="container full">
          <Masthead
            isSignedIn={isUserSignedIn}
            handleSignIn={this.handleSignIn}
            handleSignOut={this.handleSignOut}
            handleShowAddBookmark={this.handleShowAddBookmark}
          />
          {this.renderBookmarkList()}
          <Footer isUserSignedIn={isUserSignedIn} />
        </div>
      </>
    );
  }
}
