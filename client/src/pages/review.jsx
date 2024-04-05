import axios from "axios";
import { Chat } from "../components/chat";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { Component } from "react";
import {
  asterisk,
  closeTicket,
  deleteTicket,
  editTicket,
  openTicket,
  profilePlaceholder,
} from "../assets";
import { getAuthToken, getAuthUser, getAuthLevel } from "../components/auth";
import { HOST } from "../const";
import { Label } from "../components/label";
import { ChatInfo } from "../components/chatinfo";
class Review extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statusFilter: [],
      tagFilter: [],
      tagInput: [],
      posts: [],
      open: -1,
      showAction: true,
      showClosed: false,
      showOverdue: false,
      showProgress: false,
      height: 0,
      toggleList: true,
    };
    this.onImgLoad = this.onImgLoad.bind(this);
  }
  onImgLoad({ target: img }) {
    let currentHeight = this.state.height;
    if (currentHeight < img.offsetHeight) {
      this.setState({
        height: img.offsetHeight,
      });
    }
  }
  handleDelete = (id) => {
    if (!window.confirm(`Are you sure you want to delete this ticket?`)) {
      return;
    }

    axios
      .delete(`${HOST}/ticket/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      })
      .then((res) => {
        alert("Ticket deleted");
        window.location.reload(false);
      })
      .catch((err) => alert(err.response.data));
  };
  updatePosts = async () => {
    const filters = [];
    if (this.state.showAction) filters.push("new", "pending review");
    if (this.state.showProgress) filters.push("pending response");
    if (this.state.showClosed) filters.push("completed", "closed");
    const len = this.state.posts.length;

    await axios
      .post(
        `${HOST}/ticket`,
        {
          username: getAuthUser(),
          //status: filters,
        },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      )
      .then((res) => {
        const posts = res.data;
        const actionNeededCount = posts.filter(
          (post) => post.status === "new" || post.status === "pending review"
        ).length;
        const inProgressCount = posts.filter(
          (post) => post.status === "pending response"
        ).length;
        const overdueCount = posts.filter(
          (post) => post.status === "overdue"
        ).length; // Adjust based on actual logic
        const closedCount = posts.filter(
          (post) => post.status === "completed" || post.status === "closed"
        ).length;
        if (len != posts.length) {
          this.setState({ open: -1 });
        }
        this.setState({
          posts: posts.filter((post) => filters.includes(post.status)),
          actionNeededCount,
          inProgressCount,
          overdueCount,
          closedCount,
        });
      })
      .catch((err) => {
        console.log(err.response || err);
      });
  };

  getPosts() {
    return this.state.posts;
  }
  componentDidMount() {
    this.updatePosts();
  }

  archive = () => {
    if (this.state.actionLock) {
      return;
    }
    this.setState({
      actionLock: true,
    });
    axios
      .post(
        `${HOST}/ticket/update/${this.state.id}`,
        { status: "archived" },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      )
      .then((res) => {
        console.log(res);
        window.location.reload(false);
        alert("Ticket Archived!");
      })
      .catch((err) => {
        console.log(err.response || err);
      });
  };
  open = (id, chat) => {
    if (this.state.actionLock) {
      return;
    }
    this.setState({
      actionLock: true,
    });
    axios
      .post(
        `${HOST}/ticket/update/${id}`,
        {
          status:
            chat.length == 0
              ? "new"
              : chat[chat.length - 1].isClient
              ? "pending review"
              : "pending response",
        },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      )
      .then((res) => {
        console.log(res);
        this.state.actionLock = false;
        this.updatePosts();
        alert("Ticket Reopened!");
      })
      .catch((err) => {
        console.log(err.response || err);
        this.state.actionLock = false;
      });
  };
  close = (id) => {
    if (this.state.actionLock) {
      return;
    }
    this.setState({
      actionLock: true,
    });
    axios
      .post(
        `${HOST}/ticket/update/${id}`,
        { status: "closed" },
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      )
      .then((res) => {
        console.log(res);
        this.updatePosts();
        alert("Ticket Closed!");
        this.state.actionLock = false;
      })
      .catch((err) => {
        console.log(err.response || err);
        this.state.actionLock = false;
      });
  };
  delete = (id) => {
    if (!window.confirm(`Are you sure you want to delete this ticket?`)) {
      return;
    }
    if (this.state.actionLock) {
      return;
    }
    this.setState({
      actionLock: true,
    });
    axios
      .delete(`${HOST}/ticket/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      })
      .then((res) => {
        console.log(res);
        alert("Ticket Deleted!");
        this.updatePosts();
        this.state.actionLock = false;
      })
      .catch((err) => {
        console.log(err.response || err);
        this.state.actionLock = false;
      });
  };
  edit = (id) => {
    window.location.replace(`/edit/${id}`);
  };

  render() {
    return (
      <div className="container">
        <div className="row welcome-ticket">
          <div className="col title">
            <h1>Welcome {getAuthUser()}!</h1>
          </div>
          <div className="create col">
            <a href="/new-ticket">
              <div className="btn">
                <div className="row">
                  <div className="icon col-2">
                    <img src={asterisk} />
                  </div>
                  <p className="col">Create a Ticket</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {this.state.posts ? (
          <>
            <div className="row status">
              <button
                className={`col ${
                  this.state.showAction ? "status-active" : "status-inactive"
                }`}
                onClick={() => {
                  this.setState(
                    { open: -1, showAction: !this.state.showAction },
                    () => this.updatePosts()
                  );
                }}>
                <h1>{this.state.actionNeededCount}</h1>
                <h3>Action Needed</h3>
              </button>

              <button
                className={`col ${
                  this.state.showProgress ? "status-active" : "status-inactive"
                }`}
                onClick={() => {
                  this.setState(
                    { open: -1, showProgress: !this.state.showProgress },
                    () => this.updatePosts()
                  );
                }}>
                <h1>{this.state.inProgressCount}</h1>
                <h3>Awaiting Response</h3>
              </button>
              <button
                className={`col ${
                  this.state.showOverdue ? "status-active" : "status-inactive"
                }`}
                onClick={() => {
                  this.setState(
                    { open: -1, showOverdue: !this.state.showOverdue },
                    () => this.updatePosts()
                  );
                }}>
                <h1>{this.state.overdueCount}</h1>
                <h3>Overdue</h3>
              </button>
              <button
                className={`col ${
                  this.state.showClosed ? "status-active" : "status-inactive"
                }`}
                onClick={() => {
                  this.setState(
                    { open: -1, showClosed: !this.state.showClosed },
                    () => this.updatePosts()
                  );
                }}>
                <h1>{this.state.closedCount}</h1>
                <h3>Closed</h3>
              </button>
            </div>
            <div
              style={{ display: "inline-flex", width: "100%", height: "100%" }}>
              <div
                id="panel"
                className={
                  this.state.open == -1
                    ? "ticket-container"
                    : "ticket-container-shrink"
                }>
                <div className="ticket-panel">
                  <div className="ticket-header">
                    <h4 style={{ marginTop: -2 }}>Active Tickets</h4>
                    <div className="ticket-action-bar">
                      {this.state.open == -1 && (
                        <h4 style={{ color: "#6C7577" }}>Manage Tickets</h4>
                      )}
                      <a href="/new-ticket" style={{ textDecoration: "none" }}>
                        <h4 style={{ color: "#0C58EF" }}>+ New Ticket</h4>
                      </a>
                    </div>
                  </div>
                  {this.state.posts.map((ticket, index) => {
                    return (
                      <div
                        className="ticket-item"
                        onClick={() => {
                          this.state.open == -1
                            ? this.setState({ open: index })
                            : this.setState({ open: -1 });
                        }}>
                        <div
                          style={{
                            display: "inline-flex",
                            gap: 16,
                            minWidth: "100%",
                          }}>
                          <div className="ticket-preview">
                            <img src={profilePlaceholder} />
                            <Label status={ticket.status} />
                          </div>
                          <div className="ticket-text">
                            <h3>{ticket.title}</h3>
                            <div className="ticket-description">
                              <p>{ticket.comments}</p>
                            </div>
                            <p>
                              <strong>Created By:</strong>{" "}
                              {ticket.username.charAt(0).toUpperCase() +
                                ticket.username.slice(1)}
                              &nbsp;&nbsp;&nbsp;<strong>Domain:</strong>{" "}
                              {ticket.domainURL}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              marginLeft: "auto",
                            }}>
                            {ticket.status == "closed" ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.open(ticket._id, ticket.chat);
                                }}>
                                <img
                                  style={{ cursor: "pointer" }}
                                  src={openTicket}
                                />
                              </div>
                            ) : (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.close(ticket._id);
                                }}>
                                <img
                                  style={{ cursor: "pointer" }}
                                  src={closeTicket}
                                />
                              </div>
                            )}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                this.edit(ticket._id);
                              }}>
                              <img
                                style={{ cursor: "pointer" }}
                                src={editTicket}
                              />
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                this.delete(ticket._id);
                              }}>
                              <img
                                style={{ cursor: "pointer" }}
                                src={deleteTicket}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {this.state.open != -1 && this.state.posts[this.state.open] && (
                <div className="chat-panel">
                  <ChatInfo post={this.state.posts[this.state.open]} />
                  <Chat
                    post={this.state.posts[this.state.open]}
                    callback={this.updatePosts}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    );
  }
}
export default Review;
