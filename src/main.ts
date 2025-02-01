'use strict';
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';

import {
    checkEvent,
    editArrayButtons,
    exchangePlaceholderWithValue,
    generateActions,
    generateNewObjectStructure,
    getMenusWithUserToSend,
    getUserToSendFromUserListWithChatID,
} from './lib/action.js';
import { _subscribeForeignStatesAsync } from './lib/subscribeStates.js';
import { sendToTelegram } from './lib/telegram.js';
import { changeValue, decomposeText } from './lib/utilities.js';
import { createState } from './lib/createState.js';
import { saveMessageIds } from './lib/messageIds.js';
import { adapterStartMenuSend } from './lib/adapterStartMenuSend.js';
import { checkEveryMenuForData, getStateIdsToListenTo, getTimeouts } from './lib/processData.js';
import { deleteMessageAndSendNewShoppingList, shoppingListSubscribeStateAndDeleteItem } from './lib/shoppingList.js';
import { debug, error } from './lib/logging.js';

import type {
    Checkboxes,
    DataObject,
    GeneratedActions,
    IsUserActiveCheckbox,
    ListOfMenus,
    MenuData,
    MenusWithUsers,
    NewObjectNavStructureKey,
    SetStateIds,
    StartSides,
    UserListWithChatId,
} from './lib/telegram-menu.js';
import type { BooleanString } from '@/types/app.js';
import { checkIsTelegramActive } from './lib/connection.js';
import { isDefined, isFalsy, isString } from './lib/global';

const timeoutKey = '0';
let subscribeForeignStateIds: string[];

export default class TelegramMenu extends utils.Adapter {
    private static instance: TelegramMenu;

    /**
     * @param [options] - Adapter options
     */
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'telegram-menu',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        TelegramMenu.instance = this;
    }

    public static getInstance(): TelegramMenu {
        return TelegramMenu.instance;
    }

    private async onReady(): Promise<void> {
        await this.setState('info.connection', false, true);
        await createState(this);

        let instanceTelegram: string = this.config.instance;
        if (!instanceTelegram || instanceTelegram.length == 0) {
            instanceTelegram = 'telegram.0';
        }
        const telegramID = `${instanceTelegram}.communicate.request`;
        const botSendMessageID = `${instanceTelegram}.communicate.botSendMessageId`;
        const requestMessageID = `${instanceTelegram}.communicate.requestMessageId`;
        const infoConnectionOfTelegram = `${instanceTelegram}.info.connection`;

        const checkboxes: Checkboxes = this.config.checkbox as Checkboxes;
        const one_time_keyboard: boolean = checkboxes.oneTiKey;
        const resize_keyboard: boolean = checkboxes.resKey;
        const checkboxNoEntryFound: boolean = checkboxes.checkboxNoValueFound;
        const sendMenuAfterRestart: boolean = checkboxes.sendMenuAfterRestart;
        let listOfMenus: ListOfMenus = [];
        if (this.config.usersInGroup) {
            listOfMenus = Object.keys(this.config.usersInGroup);
        }
        const token = this.config.tokenGrafana;
        const directoryPicture: string = this.config.directory;
        const isUserActiveCheckbox: IsUserActiveCheckbox = this.config.userActiveCheckbox;
        const menusWithUsers: MenusWithUsers = this.config.usersInGroup;
        const textNoEntryFound: string = this.config.textNoEntry;
        const userListWithChatID: UserListWithChatId[] = this.config.userListWithChatID;
        const dataObject: DataObject = this.config.data as DataObject;
        const startSides: StartSides = {};

        const menuData: MenuData = {
            data: {},
        } as MenuData;

        Object.keys(menusWithUsers).forEach(element => {
            startSides[element] = dataObject.nav[element][0].call;
        });

        await this.getForeignObject(infoConnectionOfTelegram, async (err, obj) => {
            try {
                if (err || obj == null) {
                    this.log.error(`The State ${infoConnectionOfTelegram} was not found! ${err}`);
                    return;
                }

                const isTelegramActive = await checkIsTelegramActive(infoConnectionOfTelegram);
                if (!isTelegramActive) {
                    return;
                }

                const { nav, action } = dataObject;

                this.log.info('Telegram was found');

                for (const name in nav) {
                    const value = editArrayButtons(nav[name], this);

                    const newObjectStructure = generateNewObjectStructure(value);
                    if (newObjectStructure) {
                        menuData.data[name] = newObjectStructure;
                    }

                    const generatedActions: GeneratedActions | undefined = generateActions(
                        action[name],
                        menuData.data[name],
                    );
                    if (generatedActions) {
                        menuData.data[name] = generatedActions?.obj;
                        subscribeForeignStateIds = generatedActions?.ids;
                    } else {
                        debug([{ text: 'No Actions generated!' }]);
                    }

                    if (subscribeForeignStateIds && subscribeForeignStateIds?.length > 0) {
                        await _subscribeForeignStatesAsync(subscribeForeignStateIds);
                    } else {
                        debug([{ text: 'Nothing to Subscribe!' }]);
                    }

                    // Subscribe Events
                    if (dataObject.action[name] && dataObject.action[name].events) {
                        for (const event of dataObject.action[name].events) {
                            await _subscribeForeignStatesAsync([event.ID]);
                        }
                    }
                    debug([
                        { text: 'Menu: ', val: name },
                        { text: 'Array Buttons: ', val: value },
                        { text: 'Gen. Actions: ', val: menuData.data[name] },
                    ]);
                }
                debug([
                    { text: 'Checkbox', val: checkboxes },
                    { text: 'MenuList', val: listOfMenus },
                ]);

                if (sendMenuAfterRestart) {
                    await adapterStartMenuSend(
                        listOfMenus,
                        startSides,
                        isUserActiveCheckbox,
                        menusWithUsers,
                        menuData,
                        userListWithChatID,
                        instanceTelegram,
                        resize_keyboard,
                        one_time_keyboard,
                    );
                }

                this.on('stateChange', async (id, state) => {
                    const setStateIdsToListenTo: SetStateIds[] = getStateIdsToListenTo();

                    const isActive = await this.checkInfoConnection(id, infoConnectionOfTelegram);
                    if (!isActive) {
                        return;
                    }

                    const obj = await this.getChatIDAndUserToSend(instanceTelegram, userListWithChatID);
                    if (!obj) {
                        return;
                    }

                    const { userToSend } = obj;

                    if (isString(state?.val) && state.val.includes('sList:')) {
                        await shoppingListSubscribeStateAndDeleteItem(
                            state.val,
                            instanceTelegram,
                            userListWithChatID,
                            resize_keyboard,
                            one_time_keyboard,
                        );

                        return;
                    }

                    if (this.isAddToShoppingList(id, userToSend)) {
                        await deleteMessageAndSendNewShoppingList(instanceTelegram, userListWithChatID, userToSend);
                        return;
                    }

                    if (
                        state &&
                        (await checkEvent(
                            dataObject,
                            id,
                            state,
                            menuData,
                            userListWithChatID,
                            instanceTelegram,
                            resize_keyboard,
                            one_time_keyboard,
                            menusWithUsers,
                        ))
                    ) {
                        return;
                    }

                    if (this.isMessageID(id, botSendMessageID, requestMessageID) && state) {
                        await saveMessageIds(state, instanceTelegram);
                    } else if (this.isMenuToSend(state, id, telegramID, userToSend)) {
                        let value = state?.val;
                        if (!value || !userToSend) {
                            return;
                        }

                        value = value.toString();
                        const calledValue = value.slice(value.indexOf(']') + 1, value.length);
                        const menus: NewObjectNavStructureKey[] = getMenusWithUserToSend(menusWithUsers, userToSend);

                        const dataFound = await checkEveryMenuForData({
                            menuData,
                            calledValue,
                            userToSend,
                            instanceTelegram,
                            resize_keyboard,
                            one_time_keyboard,
                            userListWithChatID,
                            menus,
                            isUserActiveCheckbox,
                            token,
                            directoryPicture,
                            timeoutKey,
                        });

                        debug([
                            { text: 'Groups with searched User:', val: menus },
                            { text: 'Data found:', val: dataFound },
                        ]);

                        if (!dataFound && checkboxNoEntryFound && userToSend) {
                            debug([{ text: 'No Entry found' }]);
                            await sendToTelegram(
                                userToSend,
                                textNoEntryFound,
                                undefined,
                                instanceTelegram,
                                resize_keyboard,
                                one_time_keyboard,
                                userListWithChatID,
                                'false',
                            );
                        }
                        return;
                    }
                    if (
                        state &&
                        setStateIdsToListenTo &&
                        setStateIdsToListenTo.find((element: { id: string }) => element.id == id)
                    ) {
                        debug([
                            { text: 'State, which is listen to was changed:', val: id },
                            { text: 'State:', val: state },
                        ]);

                        setStateIdsToListenTo.forEach((element, key: number) => {
                            if (element.id == id) {
                                debug([
                                    { text: 'Send Value:', val: element },
                                    { text: 'Ack:', val: state.ack },
                                ]);

                                if (
                                    !isFalsy(element.confirm) &&
                                    !state?.ack &&
                                    element.returnText.includes('{confirmSet:')
                                ) {
                                    const substring = decomposeText(
                                        element.returnText,
                                        '{confirmSet:',
                                        '}',
                                    ).substring.split(':');
                                    debug([{ text: 'Substring:', val: substring }]);
                                    let text = '';
                                    if (isDefined(state.val)) {
                                        text =
                                            substring[2] && substring[2].includes('noValue')
                                                ? substring[1]
                                                : exchangePlaceholderWithValue(substring[1], state.val.toString());
                                    }
                                    debug([{ text: 'Return-text:', val: text }]);

                                    if (text === '') {
                                        error([{ text: 'The return text cannot be empty, please check.' }]);
                                    }

                                    sendToTelegram(
                                        element.userToSend,
                                        text,
                                        undefined,
                                        instanceTelegram,
                                        resize_keyboard,
                                        one_time_keyboard,
                                        userListWithChatID,
                                        element.parse_mode as BooleanString,
                                    ).catch((e: { message: any; stack: any }) => {
                                        error([
                                            { text: 'Error SendToTelegram' },
                                            { val: e.message },
                                            { text: 'Error', val: e.stack },
                                        ]);
                                    });
                                    return;
                                }
                                debug([
                                    {
                                        text: 'Data: ',
                                        val: { confirm: element.confirm, ack: state?.ack, val: state?.val },
                                    },
                                ]);
                                if (!isFalsy(element.confirm) && state?.ack) {
                                    let textToSend = element.returnText;

                                    if (textToSend.includes('{confirmSet:')) {
                                        const substring = decomposeText(textToSend, '{confirmSet:', '}').substring;
                                        textToSend = textToSend.replace(substring, '');
                                    }

                                    let value: string | number = '';
                                    let valueChange: string | number | null = null;
                                    const resultChange = changeValue(textToSend, state.val?.toString() || '');
                                    if (resultChange) {
                                        valueChange = resultChange.val;
                                        textToSend = resultChange.textToSend;
                                    }

                                    if (textToSend?.toString().includes('{novalue}')) {
                                        value = '';
                                        textToSend = textToSend.replace('{novalue}', '');
                                    } else if (isDefined(state?.val)) {
                                        value = state.val?.toString() || '';
                                    }
                                    if (valueChange) {
                                        value = valueChange;
                                    }

                                    debug([{ text: 'Value to send:', val: value }]);
                                    textToSend = exchangePlaceholderWithValue(textToSend, value);

                                    sendToTelegram(
                                        element.userToSend,
                                        textToSend,
                                        undefined,
                                        instanceTelegram,
                                        resize_keyboard,
                                        one_time_keyboard,
                                        userListWithChatID,
                                        element.parse_mode as BooleanString,
                                    ).catch((e: { message: any; stack: any }) => {
                                        error([
                                            { text: 'Error sendToTelegram' },
                                            { val: e.message },
                                            { text: 'Error', val: e.stack },
                                        ]);
                                    });

                                    setStateIdsToListenTo.splice(key, 1);
                                }
                            }
                        });
                    }
                });
            } catch (e: any) {
                error([{ text: 'Error onReady' }, { val: e.message }, { text: 'Error', val: e.stack }]);
            }
        });

        await this.subscribeForeignStatesAsync(botSendMessageID);
        await this.subscribeForeignStatesAsync(requestMessageID);
        await this.subscribeForeignStatesAsync(`${instanceTelegram}.communicate.requestChatId`);
        await this.subscribeForeignStatesAsync(telegramID);
        await this.subscribeForeignStatesAsync(`${instanceTelegram}.info.connection`);
    }

    private isMessageID(id: string, botSendMessageID: string, requestMessageID: string): boolean {
        return id == botSendMessageID || id == requestMessageID;
    }

    private isAddToShoppingList(id: string, userToSend: string): boolean {
        return !!(id.includes('alexa-shoppinglist') && !id.includes('add_position') && userToSend);
    }

    private isMenuToSend(
        state: ioBroker.State | null | undefined,
        id: string,
        telegramID: string,
        userToSend: string | null,
    ): boolean {
        return !!(
            state &&
            typeof state.val === 'string' &&
            state.val != '' &&
            id == telegramID &&
            state?.ack &&
            userToSend
        );
    }

    private async checkInfoConnection(id: string, infoConnectionOfTelegram: string): Promise<boolean> {
        if (id === infoConnectionOfTelegram) {
            const isActive = await checkIsTelegramActive(infoConnectionOfTelegram);
            if (!isActive) {
                this.log.debug('Telegram is not active');
                return false;
            }
            return true;
        }
        return true;
    }

    private async getChatIDAndUserToSend(
        instanceTelegram: string,
        userListWithChatID: UserListWithChatId[],
    ): Promise<{ chatID: string; userToSend: string } | undefined> {
        const chatID = await this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);

        if (!chatID?.val) {
            debug([{ text: 'ChatID not found' }]);
            return;
        }

        const userToSend = getUserToSendFromUserListWithChatID(userListWithChatID, chatID.val.toString());
        if (!userToSend) {
            this.log.debug('User to send not found');
            return;
        }
        return { chatID: chatID.val.toString(), userToSend };
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback - Is called when adapter has closed all connections and released all resources
     */
    private onUnload(callback: () => void): void {
        const timeouts = getTimeouts();
        try {
            // Here you must clear all timeouts or intervals that may still be active
            timeouts.forEach((element: { timeout: string | number | NodeJS.Timeout | undefined }) => {
                clearTimeout(element.timeout);
            });

            callback();
        } catch (e: any) {
            this.log.error(`Error onUnload  ${e}`);
            callback();
        }
    }

    onMessage(obj: ioBroker.Message): void {
        if (typeof obj === 'object' && obj.message) {
            if (obj.command === 'send') {
                // e.g. send email or pushover or whatever
                this.log.info('send command');

                // Send response in callback if required
                if (obj.callback) {
                    this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
                }
            }
        }
    }
}
let adapter;
if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param [options] - Adapter options
     */
    adapter = (options: Partial<utils.AdapterOptions<undefined, undefined>> | undefined): TelegramMenu =>
        new TelegramMenu(options);
} else {
    // otherwise start the instance directly
    new TelegramMenu();
}
export { adapter };
