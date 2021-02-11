class Scene3 extends Phaser.Scene {
	constructor() {
		super({ key: 'Scene3' })
	}
  
  create() {
    this.add.text(110, 450, `And you're vewy VEWY little!`, {fill: '#000000', fontSize: '20px'})
    
		this.input.on('pointerdown', () => {
			this.scene.stop('Scene3')
			this.scene.start('Level')
		})
  }
}
