import { inline } from '@css-inline/css-inline';
import * as fs from 'fs';
import * as glob from 'glob';
import * as handlebars from 'handlebars';
import { HelperDeclareSpec } from 'handlebars';
import { get } from 'lodash';
import * as path from 'path';
import {
  MailerOptions,
  TemplateAdapter,
  TemplateAdapterConfig,
} from '../../../../sdk/src/interfaces';

export class HandlebarsAdapter implements TemplateAdapter {
  private precompiledTemplates: {
    [name: string]: handlebars.TemplateDelegate;
  } = {};

  private config: TemplateAdapterConfig = {
    inlineCssOptions: {},
    inlineCssEnabled: true,
  };

  constructor(helpers?: HelperDeclareSpec, config?: TemplateAdapterConfig) {
    handlebars.registerHelper('concat', (...args) => {
      args.pop;
      return args.join('');
    });
    handlebars.registerHelper(helpers || {});
    Object.assign(this.config, config);
  }

  public compile(mail: any, callback: any, mailerOptions: MailerOptions): void {
    const precompile = (template: any, callback: any, options: any) => {
      const templateBaseDir = get(options, 'dir', '');
      const templateExt = path.extname(template) || '.hbs';
      let templateName = path.basename(template, path.extname(template));
      const templateDir = path.isAbsolute(template)
        ? path.dirname(template)
        : path.join(templateBaseDir, path.dirname(template));
      const templatePath = path.join(templateDir, templateName + templateExt);
      templateName = path
        .relative(templateBaseDir, templatePath)
        .replace(templateExt, '');
      if (!this.precompiledTemplates[templateName]) {
        try {
          const template = fs.readFileSync(templatePath, 'utf8');
          this.precompiledTemplates[templateName] = handlebars.compile(
            template,
            get(options, 'options', {}),
          );
        } catch (error) {
          return callback(error);
        }
      }

      return {
        templateExt,
        templateName,
        templateDir,
        templatePath,
      };
    };
    const { templateName } = precompile(
      mail.data.template,
      callback,
      mailerOptions.template,
    );

    const runtimeOptions = get(mailerOptions, 'options', {
      partials: false,
      data: {},
    });

    if (runtimeOptions.partials) {
      const partialPath = path
        .join(runtimeOptions.partials.dir, '**', '*.hbs')
        .replace(/\\/g, '/');
      const files = glob.sync(partialPath);

      files.forEach((file) => {
        const { templateName, templatePath } = precompile(
          file,
          () => {},
          runtimeOptions.partials,
        );
        const templateDir = path.relative(
          runtimeOptions.partials.dir,
          path.dirname(templatePath),
        );
        handlebars.registerPartial(
          path.join(templateDir, templateName),
          fs.readFileSync(templatePath, 'utf8'),
        );
      });
    }

    const rendered = this.precompiledTemplates[templateName](
      mail.data.context,
      {
        ...runtimeOptions,
        partials: this.precompiledTemplates,
      },
    );

    if (this.config.inlineCssEnabled) {
      try {
        mail.data.html = inline(rendered, this.config.inlineCssOptions);
      } catch (error) {
        callback(error);
      }
    } else {
      mail.data.html = rendered;
    }
    return callback();
  }
}
