<h1>Communicado</h1>

<hr>

Communicado is a responsive full stack messaging application created using
React, Express, Node.js, MongoDB, Redux, npm, and styled using Bootstrap.

This application authenticates users and allows them to create profiles.
Users can change their profile information including name, passwords,
and profile pictures.

<br>
<img src='./screenshots/homepage.png'></img>
<br>

Users can find other users via a search system.
They can add each other as friends, and real time friend requests and
notifications are deployed. 

<br>
<img src ='./screenshots/addFriend.png'></img>
<br>
<img src ='./screenshots/friendspage.png'></img>
<p>
  Friend requests are sent in real time to users
  Declining a request does not notify whoever sent
  the friend request.
</p>
<img src ='./screenshots/friendRequest.png'></img>
<br>

Users can message friends or a group of friends.
However, a user can only have 1 chat with another individual.
They can have as many group chats as they would like.
New messages are rendered in real time, even messages including an image.
If a user is typing, that is rendered in real time as well. 

<br>
<img src ='./screenshots/messagespage.png'></img>
<br>

Users can also view which friends are online, and the last time
they chatted with them if they have ever.

<hr>

<h3>Architecture</h3>
The server is created using a route - model - controller system.
The view or the client sends a request to a route.
Calling the route calls the controller associated with it.
The controller then uses models to access/modify the database.

Web sockets are used so that clients can recieve real time updates.

The client is a group of components with access to a global state.
The global state can be updated using actions.
Web sockets may send data, update the global state, and the info
from the global state is passed down into the components.
