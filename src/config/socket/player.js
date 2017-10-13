
/**
 *
 *
 * @class Player
 */
class Player {
  /**
   * Creates an instance of Player.
   * @param {any} socket
   * @memberof Player
   */
  constructor(socket) {
    this.socket = socket;
    this.hand = [];
    this.points = 0;
    this.username = null;
    this.premium = 0;
    this.avatar = null;
    this.userID = null;
    this.color = null;
    this.name = null;
  }
}

export default Player;
