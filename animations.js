draw() {
  context.drawImage(this.image[i], this.position.x - this.radius, this.position.y - this.radius, this.radius * 2, this.radius * 2)
  if (i == 0) {
   i++;
  } else if (i == 1) {
   i--;
  }
 }