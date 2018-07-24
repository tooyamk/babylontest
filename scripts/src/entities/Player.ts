class Player extends Character {
    public static self:Player = null;

    constructor() {
        super();
    }

    public dipose(): void {
        if (this === Player.self) Player.self = null;

        super.dipose();
    }
}