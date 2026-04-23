"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({ origin: '*' });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Gabits API')
        .setDescription('Gabits goal & habit tracking API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const doc = swagger_1.SwaggerModule.createDocument(app, config);
    const swaggerPath = 'api-docs';
    app.use(`/${swaggerPath}`, (_req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        next();
    });
    swagger_1.SwaggerModule.setup(swaggerPath, app, doc, {
        customSiteTitle: 'Gabits API',
        customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    });
    await app.listen(3000, '0.0.0.0');
    new common_1.Logger('Bootstrap').log('Gabits API running on :3000');
}
bootstrap();
//# sourceMappingURL=main.js.map